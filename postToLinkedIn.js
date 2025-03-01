const path = require("path");
const mime = require("mime-types"); 
const fs = require("fs");
const axios = require("axios");
require("dotenv").config();
const { generateContent } = require("./utils/aiHelper");
const { selectImage } = require("./utils/fileHelper");


// Function to register an image upload
async function registerUpload() {
    try {
        const response = await axios.post(
            "https://api.linkedin.com/v2/assets?action=registerUpload",
            {
                registerUploadRequest: {
                    recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
                    owner: process.env.LINKEDIN_PERSON_URN,
                    serviceRelationships: [
                        {
                            relationshipType: "OWNER",
                            identifier: "urn:li:userGeneratedContent"
                        }
                    ]
                }
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
                    "X-Restli-Protocol-Version": "2.0.0",
                    "Content-Type": "application/json"
                }
            }
        );

        console.log('📝 Register Upload Response:', response.data);
        return {
            asset: response.data.value.asset,
            uploadUrl: response.data.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl
        };
    } catch (error) {
        console.error('❌ Register Upload Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        return null;
    }
}

// Function to upload the image
// ✅ Updated uploadImage function to detect file type
async function uploadImage(uploadUrl, imagePath) {
    try {
        const imageBuffer = fs.readFileSync(imagePath);
        const mimeType = mime.lookup(imagePath);

        const response = await axios.put(
            uploadUrl,
            imageBuffer,
            {
                headers: {
                    "Authorization": `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
                    "Content-Type": mimeType
                }
            }
        );

        console.log('📝 Upload Image Response Status:', response.status);
        return response.status === 201;
    } catch (error) {
        console.error('❌ Upload Image Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        return false;
    }
}

// Function to create a LinkedIn post
async function createLinkedInPost(assetUrn, content) {
    try {
        const response = await axios.post(
            "https://api.linkedin.com/v2/ugcPosts",
            {
                author: process.env.LINKEDIN_PERSON_URN,
                lifecycleState: "PUBLISHED",
                specificContent: {
                    "com.linkedin.ugc.ShareContent": {
                        shareCommentary: {
                            text: content
                        },
                        shareMediaCategory: "IMAGE",
                        media: [
                            {
                                status: "READY",
                                media: assetUrn
                            }
                        ]
                    }
                },
                visibility: {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
                    "X-Restli-Protocol-Version": "2.0.0",
                    "Content-Type": "application/json"
                }
            }
        );

        console.log('📝 Create Post Response:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Create Post Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        return false;
    }
}

// Function to automate LinkedIn posting
async function automateLinkedInPosting(imagePath, content) {
    try {
        console.log('🚀 Starting LinkedIn post process...');
        console.log('📝 Content:', content);
        console.log('🖼️ Image Path:', imagePath);

        // Step 1: Register Upload
        console.log('Step 1: Registering upload...');
        const uploadData = await registerUpload();
        if (!uploadData) {
            throw new Error('Failed to register upload');
        }
        console.log('✅ Upload registered successfully');

        // Step 2: Upload Image
        console.log('Step 2: Uploading image...');
        const uploadSuccess = await uploadImage(uploadData.uploadUrl, imagePath);
        if (!uploadSuccess) {
            throw new Error('Failed to upload image');
        }
        console.log('✅ Image uploaded successfully');

        // Step 3: Create LinkedIn Post
        console.log('Step 3: Creating LinkedIn post...');
        const postResult = await createLinkedInPost(uploadData.asset, content);
        if (!postResult) {
            throw new Error('Failed to create post');
        }
        console.log('✅ Post created successfully');

        return true;
    } catch (error) {
        console.error('❌ LinkedIn posting error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error;
    }
}

// Export the function for external use
module.exports = { automateLinkedInPosting };

// // ✅ Call the function with an example image
// automateLinkedInPosting("../1");