const cron = require('node-cron');
const { automateLinkedInPosting } = require('../postToLinkedIn');
const { postToLinkedIn } = require('./linkedinHelper');
const Post = require('../models/Post');

class PostScheduler {
    constructor() {
        this.scheduledPosts = new Map();
        this.processingPosts = new Set(); // Track posts being processed
        this.initializeFromDB();
    }

    async initializeFromDB() {
        try {
            // Only get posts that haven't been processed yet
            const scheduledPosts = await Post.find({ 
                status: 'scheduled',
                scheduledTime: { $gt: new Date() }
            });
            
            console.log(`📅 Initializing ${scheduledPosts.length} scheduled posts`);
            
            for (const post of scheduledPosts) {
                await this.schedulePost(
                    post.imagePath,
                    post.content,
                    post.scheduledTime,
                    post.postType,
                    post._id
                );
            }
        } catch (error) {
            console.error('❌ Error initializing scheduled posts:', error);
        }
    }

    async schedulePost(imagePath, content, scheduledTime, postType, postId) {
        const timestamp = new Date(scheduledTime).getTime();
        const jobId = `post_${timestamp}_${postId}`;

        // Don't schedule if already scheduled
        if (this.scheduledPosts.has(jobId)) {
            console.log(`⚠️ Post ${postId} already scheduled`);
            return jobId;
        }

        const date = new Date(scheduledTime);
        const cronExpression = `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} *`;

        const job = cron.schedule(cronExpression, async () => {
            // Check if post is already being processed
            if (this.processingPosts.has(postId)) {
                console.log(`⚠️ Post ${postId} is already being processed`);
                return;
            }

            // Mark post as processing
            this.processingPosts.add(postId);

            try {
                // Double-check post status in database
                const post = await Post.findById(postId);
                if (!post || post.status !== 'scheduled') {
                    console.log(`⚠️ Post ${postId} is no longer scheduled`);
                    this.cleanup(jobId, postId);
                    return;
                }

                console.log(`🚀 Executing scheduled ${postType} post:`, jobId);
                
                // Update status to processing
                await Post.findByIdAndUpdate(postId, { 
                    status: 'processing',
                    lastAttempt: new Date()
                });

                let result;
                if (postType === 'photo') {
                    result = await automateLinkedInPosting(imagePath, content);
                } else {
                    result = await postToLinkedIn(content);
                }

                // Update post status based on result
                await Post.findByIdAndUpdate(postId, { 
                    status: 'posted',
                    lastAttempt: new Date()
                });

                console.log(`✅ Successfully posted scheduled ${postType}:`, postId);
                this.cleanup(jobId, postId);
            } catch (error) {
                console.error(`❌ Failed to post scheduled content:`, error);
                await Post.findByIdAndUpdate(postId, {
                    status: 'failed',
                    $push: { 
                        errorLog: {
                            date: new Date(),
                            error: error.message
                        }
                    }
                });
                this.cleanup(jobId, postId);
            }
        });

        this.scheduledPosts.set(jobId, {
            job,
            data: { imagePath, content, scheduledTime, postType, postId }
        });

        console.log(`📅 Scheduled ${postType} post for ${date.toISOString()}`);
        return jobId;
    }

    cleanup(jobId, postId) {
        // Remove from processing set
        this.processingPosts.delete(postId);
        
        // Stop and remove the job
        const scheduledPost = this.scheduledPosts.get(jobId);
        if (scheduledPost) {
            scheduledPost.job.stop();
            this.scheduledPosts.delete(jobId);
        }
    }

    // Add method to check if a post is already scheduled
    isPostScheduled(postId) {
        return Array.from(this.scheduledPosts.values())
            .some(post => post.data.postId === postId);
    }

    // Add method to get all scheduled posts
    getScheduledPosts() {
        return Array.from(this.scheduledPosts.entries()).map(([id, post]) => ({
            id,
            ...post.data
        }));
    }
}

module.exports = new PostScheduler(); 