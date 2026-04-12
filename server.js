const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins
app.use(cors());

// GET /api/classify?name={name}
app.get("/api/classify", async (req, res) => {
  try {
    const { name } = req.query;

    // 🔴 400 - Missing or empty name
    if (!name || name.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Name query parameter is required",
      });
    }

    // 🔴 422 - Not a string
    if (typeof name !== "string") {
      return res.status(422).json({
        status: "error",
        message: "Name must be a string",
      });
    }

    // 🔗 Call Genderize API
    const response = await axios.get(
      `https://api.genderize.io?name=${encodeURIComponent(name)}`
    );

    const data = response.data;

    // 🔴 Edge case: no prediction
    if (data.gender === null || data.count === 0) {
      return res.status(422).json({
        status: "error",
        message: "No prediction available for the provided name",
      });
    }

    // 🧠 Process data
    const gender = data.gender;
    const probability = data.probability;
    const sample_size = data.count;

    const is_confident =
      probability >= 0.7 && sample_size >= 100;

    const processed_at = new Date().toISOString();

    // ✅ Success response
    return res.status(200).json({
      status: "success",
      data: {
        name: name.toLowerCase(),
        gender,
        probability,
        sample_size,
        is_confident,
        processed_at,
      },
    });
  } catch (error) {
    // 🔴 Handle upstream errors
    if (error.response) {
      return res.status(502).json({
        status: "error",
        message: "Upstream API error",
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});