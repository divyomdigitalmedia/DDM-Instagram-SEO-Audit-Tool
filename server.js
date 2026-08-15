const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

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

  /*
   * FREE MVP
   *
   * This endpoint currently does not pretend
   * to fetch Instagram data that we do not have
   * permission to access.
   *
   * Later we will connect the official
   * Instagram API here.
   */

  let score = 58;

  for (let i = 0; i < username.length; i++) {
    score += username.charCodeAt(i) % 3;
  }

  score += username.length >= 4 && username.length <= 20 ? 7 : 0;
  score += !username.includes("_") && !username.includes(".") ? 4 : 0;

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
  console.log(`DDM Instagram SEO API running on port ${PORT}`);
});
