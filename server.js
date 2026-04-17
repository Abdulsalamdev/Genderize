const express = require("express");
const cors = require("cors");

const classifyRoute = require("./routes/classifyRoute");

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Routes
app.use("/api/classify", classifyRoute);

// Health check (senior touch)
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Stage 0 API is live 🚀"
  });
});

// Global error fallback
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    status: "error",
    message: "Internal server error"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});