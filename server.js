const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
// Access the variable directly from the environment
const HF_API_KEY = process.env.HF_API_KEY; 

if (!HF_API_KEY) {
    console.error("ERROR: HF_API_KEY is not defined in the environment!");
}

const MIME = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".json": "application/json",
};

const server = http.createServer((req, res) => {
    console.log(req.method, req.url);

    // --- API proxy route ---
    if (req.method === "POST" && req.url === "/api/chat") {
        console.log(">> Proxying to Hugging Face API...");
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
            console.log(">> Body:", body.substring(0, 200));

            const options = {
                hostname: "router.huggingface.co",
                path: "/v1/chat/completions",
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + HF_API_KEY,
                    "Content-Type": "application/json",
                },
            };

            const hfReq = https.request(options, (hfRes) => {
                console.log("<< HF responded with status:", hfRes.statusCode);
                res.writeHead(hfRes.statusCode, { "Content-Type": "application/json" });
                hfRes.pipe(res);
            });

            hfReq.on("error", (err) => {
                res.writeHead(502, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: err.message }));
            });

            hfReq.write(body);
            hfReq.end();
        });
        return;
    }

    // --- Static file server ---
    let filePath = req.url === "/" ? "/index.html" : req.url;
    filePath = path.join(__dirname, filePath);

    const ext = path.extname(filePath);
    const contentType = MIME[ext] || "application/octet-stream";

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end("Not found");
            return;
        }
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log("Server running at http://localhost:" + PORT);
});
