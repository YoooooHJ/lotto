const MODEL = "gemini-2.5-flash-lite";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function validateLottoResult(data) {
  if (!data || typeof data !== "object") return null;

  const main = Array.isArray(data.main)
    ? [...new Set(data.main.map(Number))].filter((n) => Number.isInteger(n) && n >= 1 && n <= 45)
    : [];
  const bonus = Number(data.bonus);
  const reason = typeof data.reason === "string" ? data.reason.trim() : "";

  if (main.length !== 6 || !Number.isInteger(bonus) || bonus < 1 || bonus > 45 || main.includes(bonus)) {
    return null;
  }

  return {
    main: main.sort((a, b) => a - b),
    bonus,
    reason: reason || "??? ??? ????? ???? ??? ??????.",
  };
}

function buildPrompt({ birthDate, message, today, history }) {
  const historyText = (history || [])
    .slice(-6)
    .map((item) => `${item.role === "user" ? "???" : "??"}: ${item.text}`)
    .join("\n");

  return `??? ?? ?? 6/45 ?? ?? ?????. ?? ??? ??? ????? ???? ??? ??(?, ?? ?, ?? ??, ??? ?? ?)? ????, ? ??? ?? ??? ?????.

??:
- main: 1~45 ? ?? ?? ?? 6? (????)
- bonus: 1~45 ? ?? 1? (main? ?? ??)
- reason: ???? 3~5??. ????? ?? ??? ????? ???? ? ??? ?? ??? ??
- ?? ??? ???? ???? ?? reason ???? ? ???? ???
- ??? ?? ??? ??? ??? ??? ?

?? ??: ${today}
??? ????: ${birthDate}
${historyText ? `\n?? ??:\n${historyText}\n` : ""}
??? ???: ${message}

JSON? ?????.`;
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY ????? ???? ?????." });
  }

  const { birthDate, message, history } = req.body || {};

  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return res.status(400).json({ error: "????(YYYY-MM-DD)? ??? ???." });
  }

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "???? ??? ???." });
  }

  const today = new Date().toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  try {
    const response = await fetch(`${API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: buildPrompt({ birthDate, message: message.trim(), today, history }) }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              main: {
                type: "array",
                items: { type: "integer" },
              },
              bonus: { type: "integer" },
              reason: { type: "string" },
            },
            required: ["main", "bonus", "reason"],
          },
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return res.status(response.status).json({ error: "Gemini API ??? ??????.", detail: errorBody });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(502).json({ error: "AI ??? ?? ?????." });
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return res.status(502).json({ error: "AI ?? ??? ???? ????." });
    }

    const result = validateLottoResult(parsed);
    if (!result) {
      return res.status(502).json({ error: "?? ?? ??? ???? ????. ?? ??? ???." });
    }

    return res.status(200).json({
      reply: result.reason,
      recommendation: result,
    });
  } catch (error) {
    return res.status(500).json({ error: "?? ??? ??????.", detail: error.message });
  }
}
