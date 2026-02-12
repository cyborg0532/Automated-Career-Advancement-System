const https = require('https');

exports.chatProxy = (req, res) => {
    console.log(">> Proxying to Groq API...");

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
        console.error("GROQ_API_KEY not found");
        return res.status(500).json({ error: "Server configuration error: GROQ_API_KEY missing" });
    }

    // Ensure the payload matches Groq/OpenAI requirements
    const bodyData = JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: req.body.messages || [{ role: "user", content: req.body.inputs || "" }],
        temperature: req.body.parameters?.temperature || 0.7,
        max_tokens: req.body.parameters?.max_new_tokens || 1024,
        top_p: req.body.parameters?.top_p || 1,
        stream: false
    });

    const options = {
        hostname: "api.groq.com",
        path: "/openai/v1/chat/completions",
        method: "POST",
        headers: {
            "Authorization": "Bearer " + GROQ_API_KEY,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(bodyData)
        },
    };

    const groqReq = https.request(options, (groqRes) => {
        console.log("<< Groq responded with status:", groqRes.statusCode);
        res.status(groqRes.statusCode);
        res.set("Content-Type", "application/json");

        groqRes.pipe(res);
    });

    groqReq.on("error", (err) => {
        console.error("Groq Request Error:", err);
        res.status(502).json({ error: err.message });
    });

    groqReq.write(bodyData);
    groqReq.end();
};
