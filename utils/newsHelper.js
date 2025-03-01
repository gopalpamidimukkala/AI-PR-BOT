const axios = require("axios");
require("dotenv").config();

const NEWS_API_KEY = process.env.NEWS_API_KEY; // Add this key to .env file
const NEWS_API_URL = `https://newsapi.org/v2/top-headlines?country=in&apiKey=${NEWS_API_KEY}`;

async function getTrendingNews() {
    try {
        const response = await axios.get(NEWS_API_URL);
        if (response.data.articles.length === 0) {
            console.log("No trending news found.");
            return [];
        }
        return response.data.articles.slice(0, 5).map(article => ({
            title: article.title,
            description: article.description,
            url: article.url,
        }));
    } catch (error) {
        console.error("Error fetching news:", error.message);
        return [];
    }
}

module.exports = { getTrendingNews };
