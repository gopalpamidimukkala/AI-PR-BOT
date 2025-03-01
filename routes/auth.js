const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

// 🔹 Step 1: Redirect User to LinkedIn Authorization Page
router.get("/linkedin", (req, res) => {
    const linkedInAuthURL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${process.env.LINKEDIN_REDIRECT_URI}&scope=w_member_social%20profile%20email`;
    res.redirect(linkedInAuthURL);
  });  

// 🔹 Step 2: Handle LinkedIn OAuth Callback
router.get("/linkedin/callback", async (req, res) => {
  const authCode = req.query.code;
  if (!authCode) {
    return res.status(400).send("❌ Authorization Code not received.");
  }

  try {
    // 🔹 Step 3: Exchange Authorization Code for Access Token
    const tokenResponse = await axios.post("https://www.linkedin.com/oauth/v2/accessToken", null, {
      params: {
        grant_type: "authorization_code",
        code: authCode,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const accessToken = tokenResponse.data.access_token;
    res.send(`✅ Authentication successful! Access Token: ${accessToken}`);
  } catch (error) {
    console.error("❌ LinkedIn OAuth Error:", error.response ? error.response.data : error.message);
    res.status(500).send("❌ Error getting LinkedIn Access Token.");
  }
});

module.exports = router;
