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
  `https://graph.instagram.com/me?fields=id,username,name,biography,profile_picture_url,followers_count,follows_count,media_count&access_token=${encodeURIComponent(accessToken)}`
);
    const profileData = await profileResponse.json();

console.log(
  "========== INSTAGRAM API RESPONSE =========="
);

console.log(
  JSON.stringify(profileData, null, 2)
);

console.log(
  "============================================");

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
    // Do not dis  play the access token.
    // --------------------------------

    const auditData = {
  username: profileData.username || "",
  name: profileData.name || "",
  biography: profileData.biography || "",
  profile_picture_url: profileData.profile_picture_url || "",
  followers_count: profileData.followers_count || 0,
  following_count: profileData.follows_count || 0,
  media_count: profileData.media_count || 0
};

console.log("Instagram audit data:", auditData);
console.log("Instagram user connected:", profileData.username);


// --------------------------------
// Save profile temporarily
// --------------------------------

global.instagramProfiles =
  global.instagramProfiles || {};

global.instagramProfiles[profileData.username] =
  auditData;


// --------------------------------
// Redirect back to website
// --------------------------------

const websiteUrl =
  "https://divyomdigitalmedia.github.io/DDM-Instagram-SEO-Audit-Tool/";

const redirectUrl =
  websiteUrl +
  "?instagram_connected=true" +
  "&username=" +
  encodeURIComponent(profileData.username);

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

// -------------------------
// Free Instagram Audit
// -------------------------

app.get("/api/free-audit", (req, res) => {

  const username = String(
    req.query.username || ""
  )
    .trim()
    .replace(/^@/, "");

  if (!username) {
    return res.status(400).json({
      success: false,
      message: "Instagram username is required."
    });
  }

  const profiles =
    global.instagramProfiles || {};

  const profile =
    profiles[username];

  if (!profile) {
    return res.status(404).json({
      success: false,
      message:
        "Instagram profile data was not found. Please connect Instagram again."
    });
  }

  const name =
    String(profile.name || "").trim();

  const biography =
    String(profile.biography || "").trim();

  const followers =
    Number(profile.followers_count || 0);

  const following =
    Number(profile.follows_count || 0);

  const mediaCount =
    Number(profile.media_count || 0);


  // --------------------------------
  // SEO Scores
  // --------------------------------

  let profileScore = 40;
  let keywordScore = 40;
  let contentScore = 40;
  let discoverabilityScore = 35;

  const strengths = [];
  const opportunities = [];


  // Profile SEO

  if (
    name &&
    name.toLowerCase() !== username.toLowerCase()
  ) {

    profileScore += 20;

    strengths.push(
      "A descriptive profile name is publicly visible."
    );

  } else {

    opportunities.push(
      "Use a clear searchable name related to your niche."
    );

  }


  if (biography.length >= 50) {

    profileScore += 20;

    strengths.push(
      "The profile contains a meaningful bio."
    );

  } else {

    opportunities.push(
      "Expand the bio with niche keywords and a clear value proposition."
    );

  }


  // Keyword SEO

  const keywordWords =
    biography
      .toLowerCase()
      .split(/[\s,|/•:.-]+/)
      .filter(word => word.length >= 4);

  const uniqueKeywords =
    [...new Set(keywordWords)];


  if (uniqueKeywords.length >= 5) {

    keywordScore += 25;

    strengths.push(
      "Bio contains multiple descriptive keyword signals."
    );

  } else {

    opportunities.push(
      "Add more specific niche keywords to your Instagram bio."
    );

  }


  if (
    username.length >= 4 &&
    username.length <= 20
  ) {

    keywordScore += 15;

    strengths.push(
      "Username has a practical length for branding."
    );

  } else {

    opportunities.push(
      "Consider a simpler and more memorable username."
    );

  }


  // Content SEO

  if (mediaCount >= 100) {

    contentScore += 40;

    strengths.push(
      "Profile has an established public content library."
    );

  } else if (mediaCount >= 10) {

    contentScore += 25;

    strengths.push(
      "Profile has a developing content library."
    );

  } else if (mediaCount > 0) {

    contentScore += 10;

    opportunities.push(
      "Increase the consistency of searchable content."
    );

  } else {

    opportunities.push(
      "Public post count could not be reliably determined."
    );

  }


  // Discoverability

  if (biography.length > 0) {
    discoverabilityScore += 15;
  }

  if (
    name &&
    name.toLowerCase() !== username.toLowerCase()
  ) {
    discoverabilityScore += 15;
  }

  if (mediaCount >= 10) {
    discoverabilityScore += 15;
  }


  // Local SEO

  const localTerms = [
    "jamnagar",
    "rajkot",
    "ahmedabad",
    "surat",
    "vadodara",
    "gujarat",
    "india",
    "mumbai",
    "delhi",
    "pune",
    "bangalore",
    "bengaluru",
    "baroda"
  ];

  const combinedText =
    `${name} ${biography}`.toLowerCase();

  const localMatches =
    localTerms.filter(location =>
      combinedText.includes(location)
    );


  if (localMatches.length > 0) {

    discoverabilityScore += 10;

    strengths.push(
      `Local discovery signal found: ${localMatches.join(", ")}.`
    );

  } else {

    opportunities.push(
      "Add a location signal when local customers are important."
    );

  }


  // Followers

  if (followers >= 10000) {

    strengths.push(
      "Profile has a substantial public follower base."
    );

  }


  // Limits

  profileScore =
    Math.min(profileScore, 100);

  keywordScore =
    Math.min(keywordScore, 100);

  contentScore =
    Math.min(contentScore, 100);

  discoverabilityScore =
    Math.min(discoverabilityScore, 100);


  const overallScore =
    Math.round(
      (
        profileScore +
        keywordScore +
        contentScore +
        discoverabilityScore
      ) / 4
    );


  // --------------------------------
  // Free audit response
  // --------------------------------

  return res.json({

  success: true,

  auditType: "free",

  profile: {
    username: username,

    name: name,

    biography: biography,

    followers_count: followers,

    following_count: following,

    media_count: mediaCount,

    profile_picture_url:
      profileImage || ""
  },

  score: overallScore,

  categories: {
    profileSEO: profileScore,

    keywordSEO: keywordScore,

    contentSEO: contentScore,

    discoverabilitySEO:
      discoverabilityScore
  },

  strengths:
    strengths.slice(0, 5),

  opportunities:
    opportunities.slice(0, 5),

  notice:
    "This is an independent preliminary Instagram SEO assessment and is not an official Instagram or Meta ranking score."

});
// -------------------------
// Public Instagram Audit
// -------------------------

app.post("/api/audit", async (req, res) => {

  try {

    // --------------------------------
    // 1. Accept username OR Instagram URL
    // --------------------------------

    let input = String(
      req.body.username ||
      req.body.profile?.username ||
      ""
    ).trim();

    if (!input) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter an Instagram username or profile URL."
      });
    }

    // Extract username from:
    // @username
    // username
    // https://www.instagram.com/username/
    // https://www.instagram.com/username/?hl=en

    const urlMatch = input.match(
      /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^/?#]+)/i
    );

    if (urlMatch) {
      input = urlMatch[1];
    }

    const username = input
      .replace(/^@/, "")
      .split("?")[0]
      .split("#")[0]
      .replace(/\/+$/, "")
      .trim();


    // --------------------------------
    // Validate username
    // --------------------------------

    if (!/^[a-zA-Z0-9._]{1,30}$/.test(username)) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid Instagram username or profile URL."
      });

    }


    // --------------------------------
    // 2. Fetch public Instagram page
    // --------------------------------

    const instagramUrl =
      `https://www.instagram.com/${encodeURIComponent(username)}/`;


    const instagramResponse = await fetch(
      instagramUrl,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36",

          "Accept":
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",

          "Accept-Language":
            "en-US,en;q=0.9"
        },

        redirect: "follow"
      }
    );


    const html =
      await instagramResponse.text();


    // --------------------------------
    // Instagram profile not available
    // --------------------------------

    if (
      !instagramResponse.ok ||
      !html
    ) {

      console.error(
        "Instagram profile request failed:",
        instagramResponse.status
      );

      return res.status(404).json({
        success: false,
        message:
          "Instagram profile not found or could not be loaded. Please check the username."
      });

    }


    const lowerHtml =
      html.toLowerCase();


    if (
      lowerHtml.includes(
        "sorry, this page isn't available"
      ) ||
      lowerHtml.includes(
        "page isn't available"
      )
    ) {

      return res.status(404).json({
        success: false,
        message:
          "Instagram profile not found. Please check the username."
      });

    }


    // --------------------------------
    // Helper: read meta tags
    // --------------------------------

    function getMeta(property) {

      const regex = new RegExp(
        `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`,
        "i"
      );

      const match =
        html.match(regex);

      return match
        ? match[1]
        : "";
    }


    function decodeHtml(value) {

      return String(value || "")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#x27;/gi, "'")
        .replace(/&#x2F;/gi, "/");

    }


    // --------------------------------
    // Get public profile metadata
    // --------------------------------

    const title =
      decodeHtml(
        getMeta("og:title")
      );

    const description =
      decodeHtml(
        getMeta("og:description") ||
        getMeta("description")
      );

    const profileImage =
      decodeHtml(
        getMeta("og:image")
      );


    // --------------------------------
    // Do not generate fake data
    // --------------------------------

    if (
      !title &&
      !description &&
      !profileImage
    ) {

      return res.status(422).json({
        success: false,
        message:
          "Instagram did not expose enough public profile data for a free audit. Please try again later."
      });

    }


    // --------------------------------
    // Extract visible profile numbers
    // --------------------------------

    function extractNumber(patterns) {

      for (const pattern of patterns) {

        const match =
          description.match(pattern) ||
          title.match(pattern);

        if (
          match &&
          match[1]
        ) {

          let value =
            match[1]
              .replace(/,/g, "")
              .trim()
              .toLowerCase();


          if (value.endsWith("k")) {

            return Math.round(
              parseFloat(value) * 1000
            );

          }


          if (value.endsWith("m")) {

            return Math.round(
              parseFloat(value) * 1000000
            );

          }


          const number =
            Number(value);

          if (
            Number.isFinite(number)
          ) {
            return number;
          }

        }

      }

      return 0;

    }


    const followers =
      extractNumber([
        /([\d.,]+[km]?)\s*followers/i,
        /([\d.,]+[km]?)\s*follower/i
      ]);


    const following =
      extractNumber([
        /([\d.,]+[km]?)\s*following/i
      ]);


    const mediaCount =
      extractNumber([
        /([\d.,]+[km]?)\s*posts/i,
        /([\d.,]+[km]?)\s*post/i
      ]);

    console.log("========== INSTAGRAM PUBLIC DATA ==========");
console.log("USERNAME:", username);
console.log("TITLE:", title);
console.log("DESCRIPTION:", description);
console.log("PROFILE IMAGE:", profileImage);
console.log("FOLLOWERS:", followers);
console.log("FOLLOWING:", following);
console.log("POSTS:", mediaCount);
console.log("==========================================");

    // --------------------------------
    // Profile name
    // --------------------------------

    let name =
      title
        .replace(/\s*\(@[^)]*\).*$/i, "")
        .replace(/\s*•\s*Instagram.*$/i, "")
        .trim();


    if (!name) {
      name = username;
    }


    // --------------------------------
    // Biography
    // --------------------------------

    let biography =
      description.trim();

    console.log("========== PROFILE DATA ==========");
console.log("NAME:", name);
console.log("BIO:", biography);
console.log("FOLLOWERS:", followers);
console.log("FOLLOWING:", following);
console.log("POSTS:", mediaCount);
console.log("================================");

    // --------------------------------
    // SEO Analysis
    // --------------------------------

    let profileScore = 40;
    let keywordScore = 40;
    let contentScore = 40;
    let discoverabilityScore = 35;


    const strengths = [];
    const opportunities = [];


    // Profile SEO

    if (
      name &&
      name !== username
    ) {

      profileScore += 20;

      strengths.push(
        "A descriptive profile name is publicly visible."
      );

    } else {

      opportunities.push(
        "Use a clear searchable name related to your niche."
      );

    }


    if (
      biography.length >= 50
    ) {

      profileScore += 20;

      strengths.push(
        "The public profile contains a meaningful bio."
      );

    } else {

      opportunities.push(
        "Expand the bio with niche keywords and a clear value proposition."
      );

    }


    // Keyword SEO

    if (
      username.length >= 4 &&
      username.length <= 20
    ) {

      keywordScore += 15;

      strengths.push(
        "Username has a practical length for branding."
      );

    } else {

      opportunities.push(
        "Consider a simpler and more memorable username."
      );

    }


    const keywordWords =
      biography
        .toLowerCase()
        .split(/[\s,|/•:.-]+/)
        .filter(
          word => word.length >= 4
        );


    const uniqueKeywords =
      [
        ...new Set(keywordWords)
      ];


    if (
      uniqueKeywords.length >= 5
    ) {

      keywordScore += 25;

      strengths.push(
        "Bio contains multiple descriptive keyword signals."
      );

    } else {

      opportunities.push(
        "Add more specific niche keywords to your Instagram bio."
      );

    }


    // Content SEO

    if (
      mediaCount >= 100
    ) {

      contentScore += 40;

      strengths.push(
        "Profile has an established public content library."
      );

    } else if (
      mediaCount >= 10
    ) {

      contentScore += 25;

      strengths.push(
        "Profile has a developing content library."
      );

    } else if (
      mediaCount > 0
    ) {

      contentScore += 10;

      opportunities.push(
        "Increase the consistency of searchable content."
      );

    } else {

      opportunities.push(
        "Public post count could not be reliably determined."
      );

    }


    // Discoverability

    if (
      biography.length > 0
    ) {

      discoverabilityScore += 15;

    }


    if (
      name &&
      name !== username
    ) {

      discoverabilityScore += 15;

    }


    if (
      mediaCount >= 10
    ) {

      discoverabilityScore += 15;

    }


    // Local signals

    const localTerms = [
      "jamnagar",
      "rajkot",
      "ahmedabad",
      "surat",
      "vadodara",
      "gujarat",
      "india",
      "mumbai",
      "delhi",
      "pune",
      "bangalore",
      "bengaluru",
      "baroda"
    ];


    const combinedText =
      `${name} ${biography}`.toLowerCase();


    const localMatches =
      localTerms.filter(
        location =>
          combinedText.includes(location)
      );


    if (
      localMatches.length > 0
    ) {

      discoverabilityScore += 10;

      strengths.push(
        `Local discovery signal found: ${localMatches.join(", ")}.`
      );

    } else {

      opportunities.push(
        "Add a location signal when local customers are important."
      );

    }


    // Followers

    if (
      followers >= 10000
    ) {

      strengths.push(
        "Profile has a substantial public follower base."
      );

    }


    // Limit scores

    profileScore =
      Math.min(profileScore, 100);

    keywordScore =
      Math.min(keywordScore, 100);

    contentScore =
      Math.min(contentScore, 100);

    discoverabilityScore =
      Math.min(
        discoverabilityScore,
        100
      );


    // Overall score

    const overallScore =
      Math.round(
        (
          profileScore +
          keywordScore +
          contentScore +
          discoverabilityScore
        ) / 4
      );


    // --------------------------------
    // Return actual public profile data
    // --------------------------------

    return res.json({

      success: true,

      profile: {

        username,

        name,

        biography,

        followers,

        following,

        media_count: mediaCount,

        profile_picture_url:
          profileImage

      },


      score:
        overallScore,


      categories: {

        profileSEO:
          profileScore,

        keywordSEO:
          keywordScore,

        contentSEO:
          contentScore,

        discoverabilitySEO:
          discoverabilityScore

      },


      strengths: [
        ...new Set(strengths)
      ],


      opportunities: [
        ...new Set(opportunities)
      ],


      notice:
        "This is an independent preliminary Instagram SEO assessment based only on publicly accessible profile information."

    });


  } catch (error) {

    console.error(
      "Instagram public audit error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to analyze the Instagram profile right now. Please try again."

    });

  }

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
