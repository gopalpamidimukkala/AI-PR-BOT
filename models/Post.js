const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: String,
  scheduledTime: Date,
  status: {
    type: String,
    enum: ['pending', 'processing', 'posted', 'failed', 'scheduled'],
    default: 'pending'
  },
  postType: {
    type: String,
    enum: ['text', 'photo'],
    default: 'text'
  },
  imagePath: String,
  attempts: {
    type: Number,
    default: 0
  },
  lastAttempt: Date,
  errorLog: [{ 
    date: Date,
    error: String 
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', postSchema);
