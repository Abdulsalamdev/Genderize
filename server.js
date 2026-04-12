const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS 
app.use(cors({
  origin: "*"
}));

// GET /api/classify?name={name}
app.get("/api/classify", async (req, res) => {
  try {
    let { name } = req.query;

    //  400 - Missing or empty name
    if (!name || name.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Name query parameter is required"
      });
    }

    //  422 - Not a string
    if (typeof name !== "string") {
      return res.status(422).json({
        status: "error",
        message: "Name must be a string"
      });
    }

    //  Normalize input
    name = name.trim().toLowerCase();

    // Call Genderize API
    const response = await axios.get(
      `https://api.genderize.io?name=${encodeURIComponent(name)}`
    );

    const { gender, probability, count } = response.data;

    // Edge case: ONLY fail if completely no data
    if (!gender && (!count || count === 0)) {
      return res.status(422).json({
        status: "error",
        message: "No prediction available for the provided name"
      });
    }

    // Ensure values exist
    const sample_size = count || 0;

    const is_confident =
      probability >= 0.7 && sample_size >= 100;

    const processed_at = new Date().toISOString();

    // Success response (STRICT FORMAT)
    return res.status(200).json({
      status: "success",
      data: {
        name,
        gender,
        probability,
        sample_size,
        is_confident,
        processed_at
      }
    });

  } catch (error) {
    // Upstream failure
    return res.status(502).json({
      status: "error",
      message: "Upstream API error"
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});