import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Groq from "groq-sdk";

const PORT = 3000;

// --------------------
// Groq Initialization
// --------------------
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// --------------------
// Server Start
// --------------------
async function startServer() {
  const app = express();

  // Middleware
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // --------------------
  // CHAT API (GROQ)
  // --------------------
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, activeMode } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages format" });
      }

      // System Prompt (Civil Engineering AI)
      const systemPrompt = `
You are "RPI Civil Engineering Master AI".
You help Civil Engineering students and professionals.

Rules:
- Answer mainly in Bangla
- Use English technical terms (Concrete, Soil, Load, Stress etc.)
- Keep answers short unless user asks for detail
- Always be accurate and practical
`;

      // Convert messages for Groq
      const formattedMessages = [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      ];

      // Groq API Call
      const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: formattedMessages,
        temperature: 0.7,
      });

      const reply =
        response.choices[0]?.message?.content ||
        "Sorry, response not generated.";

      res.json({ reply });
    } catch (err: any) {
      console.error("Groq Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // --------------------
  // Vite Integration
  // --------------------
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Start server
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
