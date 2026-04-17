const { fetchGenderData } = require("../services/genderizeService");

exports.classifyName = async (req, res) => {
  try {
    let { name } = req.query;

    // Validate presence
    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Missing or empty name parameter"
      });
    }

    // Validate type
    if (typeof name !== "string") {
      return res.status(422).json({
        status: "error",
        message: "Name must be a string"
      });
    }

    // Normalize
    name = name.trim().toLowerCase();

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Missing or empty name parameter"
      });
    }

    // Call service
    const data = await fetchGenderData(name);

    const { gender, probability, count } = data;

    // Edge case handling
    if (!gender || count === 0) {
      return res.status(502).json({
        status: "error",
        message: "No prediction available for the provided name"
      });
    }

    // Compute confidence
    const is_confident =
      probability >= 0.7 && count >= 100;

    //  Build response
    return res.status(200).json({
      status: "success",
      data: {
        name,
        gender,
        probability,
        sample_size: count,
        is_confident,
        processed_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Controller Error:", error.message);

    // Upstream failure
    return res.status(502).json({
      status: "error",
      message: "Upstream service failure"
    });
  }
};