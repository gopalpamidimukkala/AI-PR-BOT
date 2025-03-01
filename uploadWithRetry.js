const axios = require("axios");
const fs = require("fs");

// Function to upload the image to LinkedIn with retry logic
async function uploadWithRetry(uploadUrl, imagePath, maxRetries = 3) {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            const response = await axios.put(uploadUrl, fs.createReadStream(imagePath), {
                headers: {
                    "Authorization": `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
                    "media-type-family": "STILLIMAGE",
                }
            });

            if (response.status === 201) {
                console.log("✅ Upload successful!");
                return true;
            }
        } catch (error) {
            console.error(`Upload attempt ${attempt + 1} failed:`, error.message);
            attempt++;
            await new Promise(res => setTimeout(res, 2000 * attempt)); // Exponential backoff
        }
    }
    console.error("❌ Upload failed after multiple attempts.");
    return false;
}

module.exports = { uploadWithRetry };
