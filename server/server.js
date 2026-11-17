import express from "express";
import cors from "cors";
import "dotenv/config";
import Groq from "groq-sdk";

const app = express()
const port = process.env.PORT || 3000;
const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.post("/api/translate", async (req, res) => {
  const { text, language } = req.body;
  const messages = [
    { role: "system", 
      content: `You are language translator. Translate the given content in user message  to ${language}. 
      The response should strictly only be the translated text, no extra information, comments, greetings etc.` 
    }
  ]
  messages.push({ role: "user", content: text })
  try{
    const response = await client.chat.completions.create({
      model: process.env.GROQ_API_MODEL,
      messages: messages
    })
    res.json({ translation: response.choices[0].message.content });
  }catch(error){
    console.error("Error during translation:", error);
    return res.status(500).json({ error: "Translation failed" });
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});