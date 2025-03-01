const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getTrendingNews } = require("./newsHelper");
require("dotenv").config();

async function generateContent(basePrompt) {
  try {
    // Fetch trending news in India
    const news = await getTrendingNews();
    let newsContext = news.map(n => `- ${n.title}: ${n.description}`).join("\n");

    // Enhance the prompt with context
    const enhancedPrompt = `
Create a professional and engaging LinkedIn post based on the following input:

${basePrompt}

Consider these trending topics for context:
${newsContext}

Guidelines:
- Keep the tone professional and engaging
- Include relevant hashtags
- Maintain LinkedIn's best practices
- Keep the length appropriate for LinkedIn
- Make it attention-grabbing but professional
`;

    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro-002" });

    // Generate content with enhanced prompt
    const result = await model.generateContent(enhancedPrompt);
    const generatedText = result.response.text();

    // Validate the generated content
    if (!generatedText || generatedText.length < 20) {
      throw new Error('Generated content is too short or empty');
    }

    return generatedText;
  } catch (error) {
    console.error("❌ AI Generation Error:", error.response ? error.response.data : error.message);
    throw error;
  }
}

module.exports = { generateContent };
