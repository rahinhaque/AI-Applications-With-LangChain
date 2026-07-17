export default async function handler(request, response) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = request.body;

  if (!message) {
    return response.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ 
      error: 'Gemini API key is not configured on the server. Please add GEMINI_API_KEY to your Vercel Environment Variables.' 
    });
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: message }],
            },
          ],
        }),
      }
    );

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      console.error("Gemini API Error Response:", errorBody);
      return response.status(res.status).json(
        errorBody || { error: `Gemini API returned status ${res.status}` }
      );
    }

    const data = await res.json();
    return response.status(200).json(data);
  } catch (error) {
    console.error("Serverless Function Error:", error);
    return response.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
