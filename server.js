/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

// Port 3000 is required by the infrastructure
const PORT = 3000;

// Lazy initialize Gemini client to prevent crash on startup if key is missing
let aiClient = null;

function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please add it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Main structure ingestion route
  app.post("/api/ingest", async (req, res) => {
    try {
      const { script, title, slideCountPreference, audiencePreference, targetLang = "en" } = req.body;
      
      if (!script || typeof script !== "string") {
        return res.status(400).json({ error: "Missing or invalid 'script' field in request body." });
      }

      console.log(`Ingesting script. Length: ${script.length}. Slide pref: ${slideCountPreference || "auto"}. Lang: ${targetLang}`);

      const client = getGeminiClient();

      const userPreferenceText = [
        title ? `The title of this presentation is: "${title}".` : "",
        slideCountPreference ? `The user prefers approximately ${slideCountPreference} slides.` : "Decompose into a logical flow of slides.",
        audiencePreference ? `Target audience/style: ${audiencePreference}.` : ""
      ].filter(Boolean).join(" ");

      // Craft highly adaptive English/Tamil instructions
      let systemInstruction = 
        "You are an expert slide deck architect and curriculum designer. " +
        "Your task is to analyze a raw presentation outline, transcript, or draft script, and transform it into a highly structured 'Knode Package'. " +
        "This package is specifically designed to be exported as a clean Markdown source file for NotebookLM. " +
        "NotebookLM will ingest this Markdown file to generate ultra-high-fidelity, coherent presentations. " +
        "Identify and extract a list of 'keyVocabulary' terms with clear, concise definitions. " +
        "Decompose the entire script sequence logically into 'slides'. Each slide must have a 'title', " +
        "2-5 clear 'bulletPoints' summarizing key concepts, a thorough set of 'speakerNotes' representing " +
        "what the presenter should say, and a plain-text 'visualSuggestion' (describing diagrams, charts, " +
        "or image layouts to display on the slide). " +
        "Crucially, make sure that the entire source script is comprehensively covered across the slides so no value is lost.";

      if (targetLang === "ta") {
        systemInstruction += 
          "\nCRITICAL REQUIREMENT: Since the user selected TAMIL language mode, you MUST write the entire structured package " +
          "primarily in professional, beautiful, and fluent Tamil language (தமிழ்). This applies to the output 'title', the 'learningObjectives', " +
          "the 'keyVocabulary' terms & definitions, the slide 'titles', 'bulletPoints', and 'speakerNotes'. " +
          "The 'visualSuggestion' and diagram descriptors can be written in English for clarity, but all student-facing & presenter-facing " +
          "text should be in clear, human, educational Tamil (or bilingual English/Tamil for technical nodes where appropriate).";
      }

      const prompt = `Analyze and format the following script content according to the schema.
      
Additional Preferences:
${userPreferenceText}

Raw script material:
----
${script}
----`;

      // Define structured response schema
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "The primary title of the presentation slide deck."
              },
              learningObjectives: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 to 5 clear, high-level learning objectives for the deck."
              },
              keyVocabulary: {
                type: Type.ARRAY,
                description: "A glossary of key concepts/terms introduced in the content with descriptions.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING, description: "The term/phrase." },
                    definition: { type: Type.STRING, description: "Clear and concise explanation." }
                  },
                  required: ["term", "definition"]
                }
              },
              slides: {
                type: Type.ARRAY,
                description: "Sequential list of slides forming the deck.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Slide Title." },
                    bulletPoints: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "2 to 5 high-impact bullet points summarizing the slide contents."
                    },
                    speakerNotes: {
                      type: Type.STRING,
                      description: "Fleshed-out talking points to expand on the slide's visual content."
                    },
                    visualSuggestion: {
                      type: Type.STRING,
                      description: "Plain text description of the layout, images, graphs, or visual assets recommended for this slide."
                    },
                    keyVocabulary: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Terms from keyVocabulary that apply specifically to this slide."
                    }
                  },
                  required: ["title", "bulletPoints", "speakerNotes", "visualSuggestion"]
                }
              }
            },
            required: ["title", "learningObjectives", "keyVocabulary", "slides"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from Gemini model.");
      }

      // Parse JSON
      const parsedData = JSON.parse(responseText.trim());
      
      // Inject unique slide IDs & numbers for editing convenience on frontend
      if (parsedData.slides && Array.isArray(parsedData.slides)) {
        parsedData.slides = parsedData.slides.map((slide, idx) => ({
          ...slide,
          id: `slide_${Date.now()}_${idx}`,
          slideNumber: idx + 1
        }));
      }

      res.json({
        id: `knode_${Date.now()}`,
        title: parsedData.title || title || (targetLang === "ta" ? "க்னோடு ஸ்லைடு தொகுப்பு" : "Knode Generated Package"),
        learningObjectives: parsedData.learningObjectives || [],
        keyVocabulary: parsedData.keyVocabulary || [],
        slides: parsedData.slides || [],
        originalScript: script,
        createdAt: new Date().toISOString(),
        lang: targetLang
      });
    } catch (err) {
      console.error("Ingest Error:", err);
      res.status(500).json({
        error: "Failed to process the presentation script, please try again.",
        details: err.message
      });
    }
  });

  // Route to edit/refine a specific slide via AI
  app.post("/api/refine-slide", async (req, res) => {
    try {
      const { slide, refinementInstructions, learningObjectives, lang = "en" } = req.body;

      if (!slide || !refinementInstructions) {
        return res.status(400).json({ error: "Missing slide or refinement instructions." });
      }

      console.log(`Refining slide: "${slide.title}" using prompt: "${refinementInstructions}"`);

      const client = getGeminiClient();

      let systemInstruction = 
        "You are an AI slide design partner. Your task is to update a specific slide's contents based on the user's instructions. " +
        "You must output a single JSON object matching the requested schema for a slide. " +
        "Keep the rest of the slide properties cohesive, and ensure changes reflect the feedback precisely.";

      if (lang === "ta") {
        systemInstruction += "\nIMPORTANT: All presenter notes, bullet points and titles must be written in Tamil (தமிழ்) as the user is working in Tamil mode.";
      }

      const prompt = `Here is the current slide content:
${JSON.stringify(slide, null, 2)}

Learning Objectives for context:
${JSON.stringify(learningObjectives || [], null, 2)}

Instructions for refinement:
"${refinementInstructions}"

Provide the updated slide in JSON format. Ensure all original fields (title, bulletPoints, speakerNotes, visualSuggestion, keyVocabulary) are present but modified as instructed.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              bulletPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              speakerNotes: { type: Type.STRING },
              visualSuggestion: { type: Type.STRING },
              keyVocabulary: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["title", "bulletPoints", "speakerNotes", "visualSuggestion"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from Gemini during slide refinement.");
      }

      const refinedSlide = JSON.parse(responseText.trim());
      
      res.json({
        ...refinedSlide,
        id: slide.id,
        slideNumber: slide.slideNumber
      });
    } catch (err) {
      console.error("Refine Slide Error:", err);
      res.status(500).json({
        error: "Failed to refine the slide with AI.",
        details: err.message
      });
    }
  });

  // Vite Integration for Serving Frontend in Development vs Production
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

  // Listen
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
