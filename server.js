// Local development server that handles auth API routes
// This runs alongside Vite during `npm run dev`
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./src/lib/auth.ts";

const app = express();
const PORT = 3001;

// Mount Better Auth handler on all /api/auth/* routes
// Express 5 requires {*path} wildcard syntax instead of /*
// IMPORTANT: Do NOT add express.json() BEFORE this route - it breaks Better Auth's body parsing
app.all("/api/auth/{*path}", (req, res) => {
  return toNodeHandler(auth)(req, res);
});

// Also handle the Gemini chat proxy (mirrors api/chat.js)
app.use(express.json());
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API key is not configured." });
  }
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
        }),
      }
    );
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\x1b[32m✓\x1b[0m Auth API server running at http://localhost:${PORT}`);
});
