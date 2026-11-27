
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST requests are allowed"
    });
  }

  const apiKey = process.env.AI_GATEWAY_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "AI Gateway key is not configured."
    });
  }

  try {
    const messages = Array.isArray(req.body?.messages)
      ? req.body.messages
          .filter(m =>
            m &&
            ["user", "assistant"].includes(m.role) &&
            typeof m.content === "string"
          )
          .slice(-20)
          .map(m => ({
            role: m.role,
            content: m.content.slice(0, 4000)
          }))
      : [];

    if (!messages.length) {
      return res.status(400).json({
        error: "No messages received."
      });
    }

    const response = await fetch(
      "https://ai-gateway.vercel.sh/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-3.5-lightning-free",
          messages: [
            {
              role: "system",
              content: "You are ULTRON, a helpful and intelligent AI assistant. Give clear, accurate and useful answers."
            },
            ...messages
          ],
          max_tokens: 500
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gateway error:", response.status, data);
      return res.status(502).json({
        error: "AI service temporarily unavailable."
      });
    }

    const reply = data.choices?.[0]?.message?.content;

    if (typeof reply !== "string" || !reply.trim()) {
      return res.status(502).json({
        error: "No reply received from AI."
      });
    }

    return res.status(200).json({
      reply: reply.trim()
    });

  } catch (error) {
    console.error("ULTRON error:", error);
    return res.status(500).json({
      error: "Something went wrong."
    });
  }
};
