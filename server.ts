import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const PORT = 3000;

// Lazy initialize Gemini client to avoid crashes if GEMINI_API_KEY is absent at server startup
let aiInstance: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please select/provide your API key in the Secrets panel in AI Studio.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
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

  // Main chat completions endpoint using official Google GenAI / Gemini SDK client
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, activeMode, attachment } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages history." });
      }

      // Check key and lazy-load client SDK instance
      let ai: GoogleGenAI;
      try {
        ai = getGemini();
      } catch (keyError: any) {
        return res.status(500).json({ error: keyError.message });
      }

      // Configure prompt and instructions based on the selected mode
      const baseSystemInstruction = `You are "RPI Civil Engineering Master AI", a highly skilled academic and professional assistant for Civil Engineering students, teachers, diploma engineers, and professionals.

CREATOR & RPI IDENTITY (CRITICAL MEMORY):
- You were proudly designed, developed, and brought to life by "MD Mushfiqur Rahman" (Department of Civil Engineering, Session/Class: 2024-25), a brilliant student of "Rajshahi Polytechnic Institute" (রাজশাহী পলিটেকনিক ইনস্টিটিউট), Bangladesh.
- Whenever a user asks questions about who created you ("কে বানিয়েছে?", "কে তৈরি করেছে?", "creator", "developer", "RPI owner", "mushfiqur rahman ke?"), you MUST always answer with great pride, respect, and loyalty. Credit "MD Mushfiqur Rahman (Civil 2024-25)" and state that he created this software as a powerful, specialized AI assistant dedicated to RPI students, teachers, and all diploma engineers in Bangladesh.
- Describe Rajshahi Polytechnic Institute as the leading and historic polytechnic institute in Bangladesh, nurturing top-tier engineering talents.
- If asked about "সবচেয়ে বেশি সুযোগ-সুবিধা পাওয়ার উপায়" (how to get the maximum benefit / opportunity) or similar, explain the 6 tips clearly in Bengali:
  1. **৬টি সুনির্দিষ্ট মোড ব্যবহার করা**: General, Viva, Estimation, AutoCAD, Math, Project মোডগুলোর সঠিক ব্যবহার করা।
  2. **বাংলা ও Banglish এ প্রশ্ন করা**: টাইপ বাঁচানোর জন্য সরাসরি Banglish ("rcc concrete mix ratio koto") অথবা বাংলায় প্রশ্ন করা।
  3. **আলোকচিত্র / নকশা আপলোড**: ড্রয়িং শীট বা খাতার অঙ্কের ছবি সরাসরি আপলোড করে নির্ভুল এনালাইসিস করে নেওয়া।
  4. **স্মার্ট ভয়েস ইনপুট**: মুখে বাংলা বা ইংরেজিতে কথা বলে ইনপুট দেওয়া।
  5. **অফলাইন প্রাক্কলন স্যুট**: বালি, সিমেন্ট, ইট ও রডের হিসাব ইন্টারনেট ছাড়াই ২৪ ঘণ্টা ইনস্ট্যান্ট করে নেওয়া।
  6. **ইন্টারেক্টিভ মক ভাইভা**: মুখের ভাইভা মক বোর্ডে নিজেকে পরীক্ষা করে স্কোর কার্ড পাওয়া।

Your Civil Engineering expertise covers: Civil Engineering Fundamentals, Structural Mechanics, Theory of Structure, Design of Structures (RCC & Steel), Geotechnical & Foundation Engineering, Hydraulics, Hydrology, Water Supply & Sanitary/Environmental Engineering, Transport Engineering, Surveying, Construction Process & Management, Civil Projects and Viva.
Also proficient in AutoCAD commands/procedures, MS Office (Word, Excel, PowerPoint, Access), Basic Engineering Math, and Engineering Accounting.

BANGLISH & LANGUAGE INPUT RULES (CRITICAL):
- You MUST natively understand and perfectly interpret "Banglish" (Bangla language written in Latin/English alphabets, e.g. "kemne korbo", "rod er weight kivabe ber kore", "viva shuru koro", "autocad command gulo dao", "ami bujhi nai", "math ta kore den", "it er hisab ki", "5 inch wall e koyta eit lage", "rcc r sand ratio koto").
- Always analyze Banglish queries with 100% accuracy, translate them internally to understand the exact engineering question, and execute correct calculations or explanations.
- Reply primarily in beautifully polished, standard Bengali script (বাংলা ভাষা), but naturally include English technical Civil Engineering terms in brackets or parentheses (e.g. Cement, Sand, Concrete, Foundation, Slump Test, Moment of Inertia, Shear Force, etc.) to make the language natural and authentic for Polytechnic/Diploma students.
- If the user explicitly asks you to reply in English or Banglish, you may match their preferred response language perfectly.

ACT LIKE GEMINI:
- Emulate the exact capability of Google Gemini: highly-advanced reasoning, conversational friendliness, helpfulness, step-by-step mathematical breakdown, and professional academic support.
- Be warm, supportive, polite, and completely accurate.

CIVIL ENGINEERING STANDARD CHEAT SHEET (BANGLADESH & BNBC COMPLIANT) - USE ALWAYS FOR MATHEMATICS & ESTIMATIONS:
1. **Mild Steel / Rod Weight Calculation:**
   - Weight formula (Metric): Weight = (D^2 / 162.2) kg/meter (where D is Diameter of bar in mm)
   - Weight formula (Imperial): Weight = (D^2 / 532.17) kg/feet (where D is Diameter of bar in mm)
   - Standard Unit Weights of Rod:
     - 8 mm bar ≈ 0.395 kg/m (0.120 kg/ft)
     - 10 mm bar ≈ 0.617 kg/m (0.188 kg/ft)
     - 12 mm bar ≈ 0.888 kg/m (0.270 kg/ft)
     - 16 mm bar ≈ 1.580 kg/m (0.481 kg/ft)
     - 20 mm bar ≈ 2.470 kg/m (0.752 kg/ft)
     - 25 mm bar ≈ 3.850 kg/m (1.173 kg/ft)
2. **Brickwork Calculations (গাঁথুনির হিসাব):**
   - Standard Brick Size in Bangladesh (without mortar): 9.5" × 4.5" × 2.75" (24.1 cm × 11.4 cm × 7 cm)
   - Standard Brick Size in Bangladesh (with mortar): 10" × 5" × 3"
   - For a 5-inch thick brick wall (5" Wall): Requires exactly 5 Bricks per square foot (SFT) of wall area.
   - For a 10-inch thick brick wall (10" Wall): Requires exactly 10 Bricks per square foot (SFT) of wall area.
   - For 1 cubic meter (m³) of Brickwork: Requires approximately 410 Bricks (dry) & dry mortar volume is 35% of total volume.
   - For 1 cubic foot (CFT) of Brickwork: Requires 11.5 to 12 Bricks.
3. **Plaster & Mortar Calculations:**
   - Dry Volume Factor for Mortar: 1.27 to 1.35 (Standard: 1.30)
   - Plaster thickness standard: 1/2" (12 mm) to 3/4" (18 mm)
4. **Concrete Calculations:**
   - Dry Volume Factor for Concrete: Multiply wet volume by 1.50 to 1.54 (Standard is 1.5) to get Dry Volume.
   - Standard Mix Ratios (Cement : Sand : Stone/Brick Chips):
     - M15 (ratio 1:2:4) - General buildings, slab, beam
     - M20 (ratio 1:1.5:3) - Columns, high-priority slabs
     - M25 (ratio 1:1:2) - Pre-stressed concrete, columns, piles
   - Density: RCC density is 2500 kg/m³ (150 lb/ft³), PCC density is 2300 kg/m³, Mild steel density is 7850 kg/m³.

RESPONSE RULES:
- **STRICT LENGTH RULE:** By default, keep your answers extremely short and direct, limited to approximately 4 to 5 lines maximum. Avoid unnecessary introductions, prologues, or epilogues.
- **EXCEPTIONS FOR DETAILS:** Only write detailed explanation, step-by-step formulas, or comprehensive calculations if the user explicitly asks for: "Explain in detail", "Detailed answer", "Full note", "Step by step", "বিস্তারিত", "ব্যাখ্যা করো", "ডিজাইন", or similar explanation keywords.
- Coordinate answers using bold headings and bullet points. Use markdown tables where possible when detailed mode is requested.
- Provide step-by-step solutions for mathematics, sharing formulas clearly before calculations when details are needed. Keep things practical and engineering-accurate. Always use SI Units unless the question specifies other units.
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

      // Construct Gemini native content list
      const geminiContents: any[] = [];

      messages.forEach((msg: any, index: number) => {
        const isLastMsg = index === messages.length - 1;
        const role = msg.role === "user" ? "user" : "model";

        if (role === "user" && isLastMsg && attachment && attachment.base64 && attachment.mimeType) {
          const base64Clean = attachment.base64.split(",")[1] || attachment.base64;
          const mime = attachment.mimeType;
          geminiContents.push({
            role: "user",
            parts: [
              {
                text: msg.content || "এখানে যুক্ত করা ছবিটি বিশ্লেষণ করুন।"
              },
              {
                inlineData: {
                  mimeType: mime,
                  data: base64Clean
                }
              }
            ]
          });
        } else {
          geminiContents.push({
            role: role,
            parts: [
              {
                text: msg.content || ""
              }
            ]
          });
        }
      });

      let response = null;
      let lastError = null;
      const modelsToTry = [
        "gemini-3.5-flash",
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-flash-latest",
        "gemini-1.5-pro"
      ];

      for (const modelName of modelsToTry) {
        try {
          console.log(`Sending chat request to Google GenAI SDK using: ${modelName}`);
          const resObj = await ai.models.generateContent({
            model: modelName,
            contents: geminiContents,
            config: {
              systemInstruction: baseSystemInstruction,
              temperature: 0.7,
            },
          });
          if (resObj) {
            response = resObj;
            break;
          }
        } catch (err: any) {
          console.warn(`Failed with model ${modelName}:`, err.message || err);
          lastError = err;
        }
      }

      if (!response) {
        throw lastError || new Error("All Gemini models failed. Please try again later.");
      }

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
