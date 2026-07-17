export async function getAnswer(message: string): Promise<string> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${
        import.meta.env.VITE_GEMINI_API_KEY
      }`,
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
      },
    );

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      console.error("Gemini error details:", errorBody);
      throw new Error(`Gemini error: ${res.status}`);
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return reply ?? "Sorry, I didn't get a response.";
  } catch (err) {
    console.error(err);
    return "Sorry, something went wrong.";
  }
}
