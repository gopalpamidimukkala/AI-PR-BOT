const express = require("express");
const Post = require("../models/Post");
const router = express.Router();

// Create a Post
router.post("/", async (req, res) => {
  try {
    const { content, platform } = req.body;
    const newPost = new Post({ content, platform });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: "Failed to create post" });
  }
});

// Get All Posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

module.exports = router;
