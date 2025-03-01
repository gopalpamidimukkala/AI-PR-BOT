require("dotenv").config();
const axios = require("axios");

async function postToLinkedIn(content) {
  try {
    const response = await axios.post(
      "https://api.linkedin.com/v2/ugcPosts",
      {
        author: process.env.LINKEDIN_PERSON_URN, // ✅ Correct LinkedIn Person URN
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: content },
            shareMediaCategory: "NONE",
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
          "X-Restli-Protocol-Version": "2.0.0",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 201 || response.status === 200) {
      console.log("✅ Post Successful:", response.data);
      return { success: true, data: response.data };
    } else {
      throw new Error('Unexpected response status: ' + response.status);
    }
  } catch (error) {
    console.error("❌ LinkedIn Posting Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
}

// Add fallback function for testing/development
async function postToLinkedInFallback(content) {
  try {
    console.log('Posting to LinkedIn (Development Mode):', content);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, data: { id: 'dev-' + Date.now() } };
  } catch (error) {
    console.error('LinkedIn posting error:', error);
    return { success: false, error: error.message };
  }
}

async function validateLinkedInToken() {
  try {
    const response = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`
      }
    });
    return response.status === 200;
  } catch (error) {
    console.error('LinkedIn token validation error:', error.message);
    return false;
  }
}

// Export both functions
module.exports = {
  postToLinkedIn: process.env.NODE_ENV === 'production' ? postToLinkedIn : postToLinkedInFallback,
  validateLinkedInToken
};
