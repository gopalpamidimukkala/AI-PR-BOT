const schedule = require('node-schedule');
const connectDB = require('./config/db');
const Post = require('./models/Post');
const { main } = require('./postToLinkedIn');

// Ensure the database is connected
connectDB();

// Function to fetch and process posts
async function fetchDuePosts() {
  try {
    const now = new Date();
    const posts = await Post.find({
      status: 'not posted',
      scheduledTime: { $lte: now },
    });

    for (const post of posts) {
      await main(post.content);
      post.status = 'posted';
      await post.save();
      console.log(`✅ Post with ID ${post._id} has been posted and updated.`);
    }
  } catch (error) {
    console.error('❌ Error fetching or processing posts:', error);
  }
}

// New functions for API endpoints
async function getAllPosts() {
  try {
    const posts = await Post.find({}).sort({ scheduledTime: -1 });
    return posts;
  } catch (error) {
    throw new Error('Failed to fetch posts');
  }
}

async function getPendingPosts() {
  try {
    const posts = await Post.find({ status: 'not posted' }).sort({ scheduledTime: 1 });
    return posts;
  } catch (error) {
    throw new Error('Failed to fetch pending posts');
  }
}

async function getPostedPosts() {
  try {
    const posts = await Post.find({ status: 'posted' }).sort({ scheduledTime: -1 });
    return posts;
  } catch (error) {
    throw new Error('Failed to fetch posted posts');
  }
}

module.exports = { 
  fetchDuePosts,
  getAllPosts,
  getPendingPosts,
  getPostedPosts
};