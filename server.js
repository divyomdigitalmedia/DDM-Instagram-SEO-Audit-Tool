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
  `https://graph.instagram.com/me?fields=id,username&access_token=${encodeURIComponent(accessToken)}`
);
    const profileData = await profileResponse.json();

    if (!profileResponse.ok) {

  console.error("Instagram profile error:", profileData);

  return res.status(400).send(`
    <h2>Instagram Profile Error</h2>
    <p>Instagram authorization succeeded, but the profile API returned an error.</p>
    <p>Please check the Meta API permissions and account type.</p>
  `);
}

    // --------------------------------
    // IMPORTANT:
    // Do not display the access token.
    // --------------------------------

    const auditData = {
  username: profileData.username || "",
  name: profileData.name || "",
  biography: profileData.biography || "",
  profile_picture_url: profileData.profile_picture_url || "",
  followers_count: profileData.followers_count || 0,
  follows_count: profileData.follows_count || 0,
  media_count: profileData.media_count || 0
};

console.log("Instagram audit data:", auditData);
    
    console.log("Instagram user connected:", profileData.username);

    const profile = {
      id: profileData.id || userId,
      username: profileData.username || ""
    };

    const websiteUrl =
      "https://divyomdigitalmedia.github.io/DDM-Instagram-SEO-Audit-Tool/";

    const redirectUrl =
      websiteUrl +
      "?instagram_connected=true" +
      "&username=" +
      encodeURIComponent(profile.username);

       return res.redirect(redirectUrl);

  } catch (error) {

    console.error("Instagram callback error:", error);

    return res.status(500).send(`
      <h2>Instagram Login Error</h2>
      <p>Something went wrong while connecting Instagram.</p>
      <p>Please try again.</p>
    `);

  }
});


// -------------------------
// Basic Audit API
// -------------------------

// -------------------------
// Basic Audit API
// -------------------------

app.post("/api/audit", (req, res) => {

  const profile = req.body.profile || {};

  const username = String(profile.username || "")
    .trim()
    .replace(/^@/, "");

  const biography = String(profile.biography || "").trim();
  const name = String(profile.name || "").trim();

  if (!username) {
    return res.status(400).json({
      success: false,
      message: "Instagram profile data is required."
    });
  }

  let profileScore = 50;
  let keywordScore = 50;
  let contentScore = 50;
  let discoverabilityScore = 50;

  const strengths = [];
  const opportunities = [];

  // Profile SEO

  if (name.length >= 3) {
    profileScore += 15;
    strengths.push("Profile name is available.");
  } else {
    opportunities.push(
      "Add a clear searchable name to your Instagram profile."
    );
  }

  if (biography.length >= 50) {
    profileScore += 15;
    strengths.push("Bio contains useful profile information.");
  } else {
    opportunities.push(
      "Expand your bio with niche keywords and a clear value proposition."
    );
  }

  if (biography.length >= 100) {
    profileScore += 10;
  }

  // Keyword SEO

  const keywordCount = biography
    .split(/\s+/)
    .filter(word => word.length >= 4)
    .length;

  if (keywordCount >= 5) {
    keywordScore += 20;
    strengths.push("Bio contains multiple descriptive terms.");
  } else {
    opportunities.push(
      "Add more relevant niche keywords to your profile."
    );
  }

  if (username.length >= 4 && username.length <= 20) {
    keywordScore += 10;
  }

  // Content SEO

  const mediaCount = Number(profile.media_count || 0);

  if (mediaCount >= 10) {
    contentScore += 25;
    strengths.push("Profile has an established content library.");
  } else if (mediaCount > 0) {
    contentScore += 10;
    opportunities.push(
      "Increase the consistency of your content publishing."
    );
  } else {
    opportunities.push(
      "Create consistent content around searchable topics."
    );
  }

  // Discoverability

  if (biography.length > 0) {
    discoverabilityScore += 15;
  }

  if (name.length > 0) {
    discoverabilityScore += 15;
  }

  if (mediaCount >= 10) {
    discoverabilityScore += 15;
  }

  if (discoverabilityScore < 65) {
    opportunities.push(
      "Improve profile signals and searchable content structure."
    );
  }

  // Limit scores

  profileScore = Math.min(profileScore, 100);
  keywordScore = Math.min(keywordScore, 100);
  contentScore = Math.min(contentScore, 100);
  discoverabilityScore = Math.min(discoverabilityScore, 100);

  const overallScore = Math.round(
    (
      profileScore +
      keywordScore +
      contentScore +
      discoverabilityScore
    ) / 4
  );

  return res.json({

    success: true,

    profile: {
      username,
      name,
      biography,
      media_count: mediaCount
    },

    score: overallScore,

    categories: {
      profileSEO: profileScore,
      keywordSEO: keywordScore,
      contentSEO: contentScore,
      discoverabilitySEO: discoverabilityScore
    },

    strengths,
    opportunities,

    notice:
      "This is an independent Instagram SEO assessment and not an official Instagram ranking score."

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
