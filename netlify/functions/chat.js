// netlify/functions/chat.js
const https = require("https");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const HF_API_KEY = process.env.HF_API_KEY;

  return new Promise((resolve, reject) => {
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
      let responseBody = "";
      hfRes.on("data", (chunk) => (responseBody += chunk));
      hfRes.on("end", () => {
        resolve({
          statusCode: hfRes.statusCode,
          body: responseBody,
        });
      });
    });

    hfReq.on("error", (err) => {
      resolve({
        statusCode: 502,
        body: JSON.stringify({ error: err.message }),
      });
    });

    hfReq.write(event.body);
    hfReq.end();
  });
};