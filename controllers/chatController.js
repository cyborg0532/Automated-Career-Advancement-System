const https = require('https');

exports.chatProxy = (req, res) => {
    console.log(">> Proxying to Hugging Face API...");

    // In strict Express, we might process body with middleware.
    // However, the original code streamed the request body to the HF API.
    // Since we are using express.json() likely in server.js, req.body will be an object.
    // We need to stringify it to send to HF.

    const bodyData = JSON.stringify(req.body);
    const HF_API_KEY = process.env.HF_API_KEY;

    if (!HF_API_KEY) {
        console.error("HF_API_KEY not found");
        return res.status(500).json({ error: "Server configuration error: HF_API_KEY missing" });
    }

    const options = {
        hostname: "router.huggingface.co",
        path: "/v1/chat/completions",
        method: "POST",
        headers: {
            "Authorization": "Bearer " + HF_API_KEY,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(bodyData)
        },
    };

    const hfReq = https.request(options, (hfRes) => {
        console.log("<< HF responded with status:", hfRes.statusCode);
        res.status(hfRes.statusCode);
        // Relay headers? Maybe just content-type
        res.set("Content-Type", "application/json");

        hfRes.pipe(res);
    });

    hfReq.on("error", (err) => {
        console.error("HF Request Error:", err);
        res.status(502).json({ error: err.message });
    });

    hfReq.write(bodyData);
    hfReq.end();
};
