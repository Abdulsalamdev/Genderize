const axios = require("axios");

exports.fetchGenderData = async (name) => {
  try {
    const response = await axios.get(
      `https://api.genderize.io?name=${name}`,
      {
        timeout: 3000 // prevents hanging requests
      }
    );

    return response.data;

  } catch (error) {
    console.error("Genderize API Error:", error.message);
    throw new Error("External API failed");
  }
};