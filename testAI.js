const { generateContent } = require("./utils/aiHelper");

async function testAI() {
  const prompt = "Write a short, inspirational tweet under 280 characters.";
  const content = await generateContent(prompt);
  console.log("Generated Content:", content);
}

testAI();
