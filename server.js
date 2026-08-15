const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const APP_ID = process.env.INSTAGRAM_APP_ID;
const APP_SECRET = process.env.INSTAGRAM_APP_SECRET;

const REDIRECT_URI =
  "https://ddm-instagram-seo-audit-tool.onrender.com/auth/instagram/callback";


// -------------------------
// Home
// -------------------------

app.get("/", (req, res) => {
  res.json({
    success: true,
    service: "DDM Instagram SEO Audit API",
    status: "online"
  });
});


// -------------------------
// Health
// -------------------------

app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});


// -------------------------
// Instagram OAuth Callback
// -------------------------

app.get("/auth/instagram/callback", async (req, res) => {

  const code = req.query.code;

  if (!code) {
    return res.status(400).send(`
      <h2>Instagram Login Error</h2>
      <p>No authorization code was received.</p>
    `);
  }

  if (!APP_ID || !APP_SECRET) {
    return res.status(500).send(`
      <h2>Server Configuration Error</h2>
      <p>Instagram API credentials are not configured.</p>
    `);
  }

  try {

    // Exchange authorization code for access token
    const tokenResponse = await fetch(
      "https://api.instagram.com/oauth/access_token",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },

        body: new URLSearchParams({
          client_id: APP_ID,
          client_secret: APP_SECRET,
          grant_type: "authorization_code",
          redirect_uri: REDIRECT_URI,
          code: code
        })
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error_type) {

      console.error("Instagram token error:", tokenData);

      return res.status(400).send(`
        <h2>Instagram Token Error</h2>
        <p>Instagram did not return an access token.</p>
        <p>Please try connecting again.</p>
      `);
    }

    const accessToken = tokenData.access_token;
    const userId = tokenData.user_id;

    if (!accessToken) {

      return res.status(400).send(`
        <h2>Instagram Token Error</h2>
        <p>No access token was returned.</p>
      `);
    }


    // --------------------------------
    // Get basic Instagram profile data
    // --------------------------------

    const profileResponse = await fetch(
      `https://graph.instagram.com/v23.0/${userId}?fields=id,username,name,profile_picture_url,biography,followers_count,follows_count,media_count&access_token=${encodeURIComponent(accessToken)}`
    );

    const profileData = await profileResponse.json();

    if (!profileResponse.ok) {

      console.error("Instagram profile error:", profileData);

      return res.status(400).send(`
        <h2>Instagram Profile Error</h2>
        <p>Authorization succeeded, but profile data could not be loaded.</p>
      `);
    }


    // --------------------------------
    // IMPORTANT:
    // Do not display the access token.
    // --------------------------------

    console.log("Instagram user connected:", profileData.username);

    res.send(`
      <!DOCTYPE html>

      <html>

      <head>

        <title>Instagram Connected</title>

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        >

        <style>

          body {
            font-family: Arial, sans-serif;
            background: #08090d;
            color: white;
            text-align: center;
            padding: 70px 20px;
          }

          .box {
            max-width: 550px;
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

          .username {
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0;
          }

        </style>

      </head>

      <body>

        <div class="box">

          <h1>Instagram Connected ✓</h1>

          <p>Your Instagram account was successfully connected.</p>

          <div class="username">
            @${escapeHtml(profileData.username || "Instagram User")}
          </div>

          <p>
            We successfully received your Instagram profile data.
          </p>

          <p>
            Your full SEO audit can now be generated.
          </p>

        </div>

      </body>

      </html>
    `);

  } catch (error) {

    console.error("Instagram OAuth error:", error);

    res.status(500).send(`
      <h2>Instagram Connection Error</h2>
      <p>Something went wrong while connecting Instagram.</p>
    `);
  }
});


// -------------------------
// Basic Audit API
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

  res.json({
    success: true,
    username: username,
    notice: "Preliminary audit."
  });
});


// -------------------------
// HTML escaping
// -------------------------

function escapeHtml(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// -------------------------
// Start server
// -------------------------

app.listen(PORT, () => {

  console.log(
    `DDM Instagram SEO API running on port ${PORT}`
  );

});
