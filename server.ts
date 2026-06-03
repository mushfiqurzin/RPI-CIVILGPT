import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const PORT = 3000;

// Lazy initialization helper for Gemini SDK to prevent crashes if key is absent on start
let genAIInstance: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please provide it in the Secrets panel in AI Studio.");
    }
    genAIInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIInstance;
}

async function startServer() {
  const app = express();
  
  // High payload limit for image uploads and drawing uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Main chat completions endpoint supporting streaming or regular responses (we will use easy standard completions helper)
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, activeMode, attachment } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages history." });
      }

      // Check key
      try {
        getGenAI();
      } catch (keyError: any) {
        return res.status(500).json({ error: keyError.message });
      }

      const ai = getGenAI();

      // Configure prompt and instructions based on the selected mode
      const baseSystemInstruction = `You are "RPI Civil Engineering Master AI", a highly skilled academic and professional assistant for Civil Engineering students, teachers, diploma engineers, and professionals.
Your expertise covers: Civil Engineering Fundamentals, Structural Mechanics, Theory of Structure, Design of Structures (RCC & Steel), Geotechnical & Foundation Engineering, Hydraulics, Hydrology, Water Supply & Sanitary/Environmental Engineering, Transport Engineering, Surveying, Construction Process & Management, Civil Projects and Viva.
Also proficient in AutoCAD commands/procedures, MS Office (Word, Excel, PowerPoint, Access), Basic Engineering Math, and Engineering Accounting.

RESPONSE RULES:
- Coordinate answers using bold headings and bullet points. Use markdown tables where possible.
- Answer primarily in Bangla, but use English civil engineering technical terms (e.g., Cement, Sand, Concrete, Foundation, Silt, Excavation, Slump Test, Stress, Strain, Moment of Inertia, Shear Force, Bending Moment) when appropriate.
- Provide step-by-step solutions for mathematics, sharing formulas clearly before calculations. Keep things practical and engineering-accurate. Always use SI Units unless the question specifies other units.
- State assumptions clearly if information is incomplete. Prioritize safety (e.g., proper curing, concrete mix ratio, structural stability, scaffolding details, personal protective equipment) at all times.
- Never invent standard values. Cite codes like BNBC (Bangladesh National Building Code) or ACI / ASTM where relevant.

ACTIVE SELECTED ASSISTANCE MODE:
The user is currently studying in "${activeMode || 'General Mode'}". You should tailor your responses to fit this mode:
- If activeMode is "General Mode": Answer general academic or practical problems with clear explanations in Bangla.
- If activeMode is "Viva Mode": Act strictly as an elite Civil Engineering Examiner. Ask exactly ONE civil engineering question at a time in Bangla (incorporating English technical words). Evaluate the student's answer constructively (e.g. telling them if it is correct/partially correct), suggest the correct technical explanation, show their estimated grade/score, and ask the next single question. Avoid asking multiple questions at once.
- If activeMode is "Estimation Mode": Act as a professional Quantity Surveyor (Prakkalak). Focus on BOQ (Bill of Quantities), unit weights, takeoff calculations, rate analysis, and concrete/brickwork/plastering details.
- If activeMode is "AutoCAD Mode": Act as a Professional CAD Instructor. Explain specific drawing commands, dimensional guidelines, and layout parameters.
- If activeMode is "Math Mode": Act as an Engineering Math Tutor. Focus on solving statics, strength of materials, fluid flow, or surveying chain errors step-by-step.
- If activeMode is "Project Mode": Act as a Project Supervisor. Help with reports, thesis structures, survey reports, presentations, and checklists.`;

      // Structure contents for Gemini
      const contents: any[] = [];

      // Convert user history into Gemini parts
      messages.forEach((msg: any) => {
        const parts: any[] = [];
        
        // If it's a user message and they have multiple items, maps them
        if (msg.role === "user") {
          parts.push({ text: msg.content });
        } else {
          parts.push({ text: msg.content });
        }

        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: parts
        });
      });

      // Handle file attachments if sent with the last message
      if (attachment && attachment.base64 && attachment.mimeType) {
        // Find the last user content block in contents
        let lastUserIndex = -1;
        for (let i = contents.length - 1; i >= 0; i--) {
          if (contents[i].role === "user") {
            lastUserIndex = i;
            break;
          }
        }
        
        const attachPart = {
          inlineData: {
            mimeType: attachment.mimeType,
            data: attachment.base64.split(",")[1] || attachment.base64
          }
        };

        if (lastUserIndex !== -1) {
          contents[lastUserIndex].parts.unshift(attachPart);
        } else {
          contents.push({
            role: "user",
            parts: [attachPart, { text: "এখানে যুক্ত করা ছবিটি বিশ্লেষণ করুন।" }]
          });
        }
      }

      // Call Gemini API (use gemini-3.5-flash as default as it's multimodal, powerful and fast)
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: baseSystemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || "আমি দুঃখিত, উত্তরটি প্রস্তুত করা যায়নি। দয়া করে আবার চেষ্টা করুন।";
      res.json({ reply: replyText });

    } catch (err: any) {
      console.error("Error calling Gemini API:", err);
      res.status(500).json({ error: err.message || "একটি অভ্যন্তরীণ ত্রুটি ঘটেছে।" });
    }
  });



  // Vite Integration
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RPI Civil Engineering Master AI backend server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
