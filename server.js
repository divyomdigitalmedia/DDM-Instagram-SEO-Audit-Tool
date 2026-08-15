const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// -------------------------
// Basic routes
// -------------------------

app.get("/", (req, res) => {
  res.json({
    success: true,
    service: "DDM Instagram SEO Audit API",
    status: "online"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});


// -------------------------
// Instagram OAuth callback
// -------------------------

app.get("/auth/instagram/callback", (req, res) => {

  const code = req.query.code;

  if (!code) {
    return res.status(400).send(`
      <h2>Instagram Login Error</h2>
      <p>No authorization code was received.</p>
    `);
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Instagram Connected</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #08090d;
          color: white;
          text-align: center;
          padding: 80px 20px;
        }

        .box {
          max-width: 500px;
          margin: auto;
          padding: 35px;
          background: #11131a;
          border: 1px solid #2a2d38;
          border-radius: 18px;
        }

        h1 {
          color: #a78bfa;
        }

        p {
          color: #aaa;
          line-height: 1.6;
        }
      </style>
    </head>

    <body>

      <div class="box">

        <h1>Instagram Connected ✓</h1>

        <p>
          Your Instagram authorization was received successfully.
        </p>

        <p>
          The secure token exchange will be connected in the next step.
        </p>

      </div>

    </body>
    </html>
  `);
});


// -------------------------
// Preliminary Audit API
// -------------------------

app.post("/api/audit", (req, res) => {

  const username = String(req.body.username || "")
    .trim()
    .replace(/^@/, "");

  if (!username) {
    return res.status(400).json({
      success: false,
      message: "Instagram username is required."
    });
  }

  let score = 58;

  for (let i = 0; i < username.length; i++) {
    score += username.charCodeAt(i) % 3;
  }

  if (username.length >= 4 && username.length <= 20) {
    score += 7;
  }

  if (!username.includes("_") && !username.includes(".")) {
    score += 4;
  }

  score = Math.min(score, 89);

  res.json({
    success: true,

    username: username,

    score: score,

    categories: {
      profileSEO: Math.min(score + 5, 100),
      keywordSEO: Math.max(score - 4, 35),
      contentSEO: Math.max(score - 8, 35),
      localSEO: Math.max(score - 13, 30)
    },

    strengths: [
      "Username is available for analysis.",
      "Profile has an optimization starting point.",
      "Username structure can be used in a broader SEO strategy."
    ],

    opportunities: [
      "Review primary profile keywords.",
      "Optimize keyword placement in the bio.",
      "Create content around specific search intent.",
      "Add local keywords when relevant.",
      "Review hashtag and metadata strategy."
    ],

    notice:
      "This is a preliminary audit. Official Instagram data will be connected after API authorization."
  });
});


app.listen(PORT, () => {
  console.log(
    `DDM Instagram SEO API running on port ${PORT}`
  );
});
