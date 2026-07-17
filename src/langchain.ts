export async function getAnswer(message: string): Promise<string> {
  try {
    const localApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const isDev = import.meta.env.DEV;

    let res: Response;

    if (isDev && localApiKey) {
      // In local development, if VITE_GEMINI_API_KEY is available, fetch from Gemini directly
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${localApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: message }],
              },
            ],
          }),
        }
      );
    } else {
      // In production or when VITE_GEMINI_API_KEY is missing, route through Vercel serverless function
      res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
    }

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      console.error("API error details:", errorBody);
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return reply ?? "Sorry, I didn't get a response.";
  } catch (err) {
    console.error(err);
    return "Sorry, something went wrong.";
  }
}
