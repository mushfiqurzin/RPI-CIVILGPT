import type { VercelRequest, VercelResponse } from "@vercel/node";
import { OpenAI } from "openai";

let openaiInstance: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is missing. Please provide it in the Environment Variables panel in your Vercel project dashboard.");
    }
    openaiInstance = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return openaiInstance;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST request
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { messages, activeMode, attachment } = req.body || {};

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages history." });
    }

    let openai: OpenAI;
    try {
      openai = getOpenAI();
    } catch (keyError: any) {
      return res.status(500).json({ error: keyError.message });
    }

    // Configure prompt and instructions based on the selected mode
    const baseSystemInstruction = `You are "RPI Civil Engineering Master AI", a highly skilled academic and professional assistant for Civil Engineering students, teachers, diploma engineers, and professionals.
Your expertise covers: Civil Engineering Fundamentals, Structural Mechanics, Theory of Structure, Design of Structures (RCC & Steel), Geotechnical & Foundation Engineering, Hydraulics, Hydrology, Water Supply & Sanitary/Environmental Engineering, Transport Engineering, Surveying, Construction Process & Management, Civil Projects and Viva.
Also proficient in AutoCAD commands/procedures, MS Office (Word, Excel, PowerPoint, Access), Basic Engineering Math, and Engineering Accounting.

RESPONSE RULES:
- **STRICT LENGTH RULE:** By default, keep your answers extremely short and direct, limited to approximately 4 to 5 lines maximum. Avoid unnecessary introductions, prologues, or epilogues.
- **EXCEPTIONS FOR DETAILS:** Only write detailed explanation, step-by-step formulas, or comprehensive calculations if the user explicitly asks for: "Explain in detail", "Detailed answer", "Full note", "Step by step", "বিস্তারিত", "ব্যাখ্যা করো", "ডিজাইন", or similar explanation keywords.
- Coordinate answers using bold headings and bullet points. Use markdown tables where possible when detailed mode is requested.
- Answer primarily in Bangla, but use English civil engineering technical terms (e.g., Cement, Sand, Concrete, Foundation, Silt, Excavation, Slump Test, Stress, Strain, Moment of Inertia, Shear Force, Bending Moment) when appropriate.
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

    // Construct OpenAI compatible message list
    const xaiMessages: any[] = [
      {
        role: "system",
        content: baseSystemInstruction
      }
    ];

    // Convert messages to Groq compatible messages
    messages.forEach((msg: any, index: number) => {
      const isLastMsg = index === messages.length - 1;
      const role = msg.role === "user" ? "user" : "assistant";

      if (role === "user" && isLastMsg && attachment && attachment.base64 && attachment.mimeType) {
        const base64Clean = attachment.base64.split(",")[1] || attachment.base64;
        const mime = attachment.mimeType;
        xaiMessages.push({
          role: "user",
          content: [
            {
              type: "text",
              text: msg.content || "এখানে যুক্ত করা ছবিটি বিশ্লেষণ করুন।"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mime};base64,${base64Clean}`
              }
            }
          ]
        });
      } else {
        xaiMessages.push({
          role: role,
          content: msg.content || ""
        });
      }
    });

    // Use standard Groq model requested: llama-3.1-8b-instant or vision preview
    const modelName = attachment ? "llama-3.2-11b-vision-preview" : "llama-3.1-8b-instant";

    const completion = await openai.chat.completions.create({
      model: modelName,
      messages: xaiMessages,
      temperature: 0.7
    });

    const replyText = completion.choices?.[0]?.message?.content || "আমি দুঃখিত, উত্তরটি প্রস্তুত করা যায়নি। দয়া করে আবার চেষ্টা করুন।";

    // Set Cache configuration or CORS headers if needed
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

    return res.status(200).json({ reply: replyText });

  } catch (err: any) {
    console.error("Vercel Serverless Function Error calling Groq API:", err);
    return res.status(500).json({ error: err.message || "একটি অভ্যন্তরীণ ত্রুটি ঘটেছে।" });
  }
}
