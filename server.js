require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const schedule = require('node-schedule');
const session = require('express-session');
const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const readline = require('readline');
const { automateLinkedInPosting } = require('./postToLinkedIn');
const { postToLinkedIn } = require('./utils/linkedinHelper');
const connectDB = require('./config/db');
const { generateContent } = require("./utils/aiHelper");
const multer = require('multer');
const path = require('path');
const Post = require('./models/Post'); // Assuming you move the schema to a separate file
const axios = require("axios");
const MongoStore = require('connect-mongo');

const app = express();
const PORT = process.env.PORT || 5002;

// Add environment-specific configurations
const isProduction = process.env.NODE_ENV === 'production';

// Enhanced logging middleware
const logger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
};

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(logger);

// Session configuration
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'fallback-secret-for-development-only',
  resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        ttl: 24 * 60 * 60
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
};

// Add warning if fallback secret is used
if (!process.env.SESSION_SECRET) {
    console.warn('\x1b[33m%s\x1b[0m', 'Warning: Using fallback session secret. Set SESSION_SECRET in .env for security.');
}

// Use the session middleware
app.use(session(sessionConfig));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
        }
    }
});

// Routes
app.post('/api/posts/generate', async (req, res) => {
  try {
    console.log('Received prompt:', req.body.prompt);
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro-002" });
    const prompt = req.body.prompt;
    
    if (!prompt) {
      return res.status(400).json({ 
        success: false,
        error: 'Prompt is required' 
      });
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Generated content is empty');
    }

    res.json({ 
      success: true,
      content: text 
    });
  } catch (error) {
    console.error('Content generation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate content',
      details: error.message 
    });
  }
});

// Separate endpoint for text posts
app.post('/api/posts/text', async (req, res) => {
  try {
    const { content, scheduledTime } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                error: 'Content is required'
            });
        }

        // Create new post document
        const newPost = new Post({
            content,
            postType: 'text',
            scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
            status: scheduledTime ? 'scheduled' : 'pending'
        });

        // Save to database first
        await newPost.save();
        console.log('Text post saved:', newPost._id);

        // Handle immediate or scheduled posting
        if (!scheduledTime) {
            try {
                const linkedInResult = await postToLinkedIn(content);
                
                if (linkedInResult.success) {
                    newPost.status = 'posted';
                    await newPost.save();
                    return res.json({
                        success: true,
                        post: newPost
                    });
                } else {
                    throw new Error(linkedInResult.error);
                }
            } catch (error) {
                newPost.status = 'failed';
                newPost.errorLog.push({
                    date: new Date(),
                    error: error.message
                });
                await newPost.save();
                throw error;
            }
        } else {
            try {
                // Schedule the post using the scheduler
                const scheduler = require('./utils/scheduler');
                const jobId = await scheduler.schedulePost(null, content, scheduledTime, 'text');
                
                // Update post with scheduling info
                newPost.status = 'scheduled';
                await newPost.save();

                return res.json({
                    success: true,
                    post: newPost,
                    jobId
                });
            } catch (scheduleError) {
                console.error('Scheduling error:', scheduleError);
                newPost.status = 'failed';
                newPost.errorLog.push({
                    date: new Date(),
                    error: 'Failed to schedule post: ' + scheduleError.message
                });
                await newPost.save();
                throw scheduleError;
            }
        }
    } catch (error) {
        console.error('Error creating text post:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create text post',
            details: error.message
        });
    }
});

// Separate endpoint for photo posts
app.post('/api/posts/photo', upload.single('image'), async (req, res) => {
    try {
        const { content, scheduledTime } = req.body;
        const imagePath = req.file?.path;

        if (!content || !imagePath) {
            return res.status(400).json({
                success: false,
                error: 'Content and image are required'
            });
        }

        // Create new post document
        const newPost = new Post({
            content,
            postType: 'photo',
            imagePath,
            scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
            status: scheduledTime ? 'scheduled' : 'pending',
            createdAt: new Date()
        });

        await newPost.save();
        console.log('Photo post saved:', newPost._id);

        // Handle immediate or scheduled posting
        if (!scheduledTime) {
            try {
                const result = await automateLinkedInPosting(imagePath, content);
                newPost.status = 'posted';
                await newPost.save();
                return res.json({
                    success: true,
                    post: newPost
                });
            } catch (error) {
                newPost.status = 'failed';
                newPost.errorLog.push({
                    date: new Date(),
                    error: error.message
                });
                await newPost.save();
                throw error;
            }
        } else {
            try {
                // Check if post is already scheduled
                const scheduler = require('./utils/scheduler');
                if (scheduler.isPostScheduled(newPost._id)) {
                    throw new Error('Post is already scheduled');
                }

                // Schedule the post
                await scheduler.schedulePost(
                    imagePath,
                    content,
                    scheduledTime,
                    'photo',
                    newPost._id
                );

                return res.json({
                    success: true,
                    post: newPost
                });
            } catch (scheduleError) {
                newPost.status = 'failed';
                newPost.errorLog.push({
                    date: new Date(),
                    error: scheduleError.message
                });
                await newPost.save();
                throw scheduleError;
            }
        }
    } catch (error) {
        console.error('Error creating photo post:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create photo post',
            details: error.message
        });
    }
});

// Improved scheduling system
class PostScheduler {
    constructor() {
        this.isProcessing = false;
        this.maxRetries = 3;
        this.retryDelay = 5 * 60 * 1000; // 5 minutes
        this.job = null;
    }

    start() {
        // Check every minute instead of every 10 seconds
        this.job = schedule.scheduleJob('* * * * *', async () => {
            await this.processScheduledPosts();
        });
        console.log('📅 Post scheduler started');
    }

    stop() {
        if (this.job) {
            this.job.cancel();
            console.log('⏹️ Post scheduler stopped');
        }
    }

    async processScheduledPosts() {
        if (this.isProcessing) {
            console.log('🔄 Already processing posts, skipping this cycle');
            return;
        }

        this.isProcessing = true;
        try {
            const now = new Date();
            const pendingPosts = await Post.find({
                status: { $in: ['pending', 'failed'] },
                scheduledTime: { $lte: now },
                attempts: { $lt: this.maxRetries }
            }).sort({ scheduledTime: 1 });

            console.log(`📝 Found ${pendingPosts.length} posts to process`);

            for (const post of pendingPosts) {
                await this.processPost(post);
            }
        } catch (error) {
            console.error('❌ Error in post processing:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    async processPost(post) {
        try {
            // Mark post as processing
            post.status = 'processing';
            post.attempts += 1;
            post.lastAttempt = new Date();
    await post.save();

            let result;
            if (post.postType === 'photo') {
                result = await automateLinkedInPosting(post.imagePath, post.content);
            } else {
                result = await postToLinkedIn(post.content);
            }

        if (result) {
          post.status = 'posted';
                console.log(`✅ Successfully posted: ${post._id}`);
        } else {
                throw new Error('Posting failed without specific error');
        }
      } catch (error) {
            post.status = 'failed';
            post.errorLog.push({
                date: new Date(),
                error: error.message
            });
            console.error(`❌ Failed to post ${post._id}:`, error.message);

            // Schedule retry if attempts remain
            if (post.attempts < this.maxRetries) {
                post.scheduledTime = new Date(Date.now() + this.retryDelay);
                console.log(`🔄 Scheduled retry for ${post._id} at ${post.scheduledTime}`);
            }
        }

        await post.save();
    }
}

// Initialize and start the scheduler
const postScheduler = new PostScheduler();

// Add the posts endpoint
app.post('/api/posts', async (req, res) => {
    try {
        console.log('Creating new post:', req.body);
        const { content, postType, scheduledTime } = req.body;

        // Validate required fields
        if (!content || !postType) {
            return res.status(400).json({
                success: false,
                error: 'Content and post type are required'
            });
        }

        // Create new post document
        const newPost = new Post({
            content,
            postType,
            scheduledTime: scheduledTime || null,
            status: scheduledTime ? 'scheduled' : 'pending',
            createdAt: new Date()
        });

        // Save to database
        await newPost.save();
        console.log('Post saved successfully:', newPost._id);

        // If it's an immediate post, post to LinkedIn
        if (!scheduledTime) {
            try {
                const linkedInResult = await postToLinkedIn(content);
                
                if (linkedInResult.success) {
                    newPost.status = 'posted';
                    await newPost.save();
                    return res.json({
                        success: true,
                        post: newPost
                    });
                } else {
                    newPost.status = 'failed';
                    newPost.errorLog.push({
                        date: new Date(),
                        error: linkedInResult.error
                    });
                    await newPost.save();
                    return res.status(500).json({
                        success: false,
                        error: 'Failed to post to LinkedIn',
                        details: linkedInResult.error
                    });
                }
            } catch (linkedInError) {
                console.error('LinkedIn posting error:', linkedInError);
                newPost.status = 'failed';
                await newPost.save();
                return res.status(500).json({
                    success: false,
                    error: 'Failed to post to LinkedIn',
                    details: linkedInError.message
                });
            }
        }

        res.json({
            success: true,
            post: newPost
        });
  } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create post',
            details: error.message
        });
    }
});

// API endpoint to get post status
app.get('/api/posts/:id/status', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json({
            status: post.status,
            attempts: post.attempts,
            lastAttempt: post.lastAttempt,
            errorLog: post.errorLog
        });
  } catch (error) {
        res.status(500).json({ error: 'Failed to fetch post status' });
    }
});

// Test LinkedIn connection
app.get('/api/linkedin/test', async (req, res) => {
    try {
        const response = await axios.get('https://api.linkedin.com/v2/me', {
            headers: {
                'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`
            }
        });
        res.json({ 
            success: true, 
            message: 'LinkedIn connection successful',
            profile: response.data
        });
  } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'LinkedIn connection failed',
            error: error.message,
            details: error.response?.data
        });
    }
});

// Update the recent posts endpoint
app.get('/api/posts/recent', async (req, res) => {
    try {
        console.log('Fetching recent posts from database...');
        const posts = await Post.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();
        
        console.log(`Successfully fetched ${posts.length} posts`);
        res.json({ success: true, posts });
  } catch (error) {
        console.error('Error fetching recent posts:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch recent posts',
            details: error.message 
        });
    }
});

// Add health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Graceful shutdown handling
const gracefulShutdown = async () => {
    console.log('🔄 Initiating graceful shutdown...');
    
    try {
        // Stop the scheduler
        postScheduler.stop();
        console.log('✅ Post scheduler stopped');

        // Close MongoDB connection
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');

        // Exit process
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server with enhanced logging
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start the server
        app.listen(PORT, () => {
            console.log(`
🚀 Server is running on port ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📅 Post scheduler: Active
🔗 MongoDB: Connected
            `);
            console.log(`Session Secret: ${process.env.SESSION_SECRET ? 'Configured ✅' : 'Missing ❌'}`);
        });

        // Start the post scheduler
        postScheduler.start();
  } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Initialize server
startServer();

// Add this after your imports
console.log('Checking LinkedIn functions:', {
    automateLinkedInPosting: typeof automateLinkedInPosting,
    postToLinkedIn: typeof postToLinkedIn
});

// Enhanced error handling
app.use((err, req, res, next) => {
    console.error('Server error:', {
        message: err.message,
        stack: isProduction ? '🔒' : err.stack,
        timestamp: new Date().toISOString()
    });

    res.status(err.status || 500).json({
        success: false,
        error: isProduction ? 'Internal Server Error' : err.message,
        ...(isProduction ? {} : { details: err.stack })
    });
});

// Add this before your API routes
if (process.env.NODE_ENV === 'production') {
    // Serve static files from the React frontend app
    app.use(express.static(path.join(__dirname, 'dist')));

    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}