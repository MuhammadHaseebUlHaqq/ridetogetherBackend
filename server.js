require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { errorHandler } = require("./middleware/errorMiddleware");
const rideRoutes = require("./routes/rideRoutes");
const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");

// Log environment variables (excluding sensitive ones)
console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('SMTP settings exist:', {
  host: !!process.env.SMTP_HOST,
  port: !!process.env.SMTP_PORT,
  user: !!process.env.SMTP_USER,
  from: !!process.env.SMTP_FROM
});

// Connect to database
console.log('Starting database connection...');
connectDB().then(() => {
  console.log('Database connection successful');
}).catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});

const app = express();

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(cors());

// Routes
app.use("/api/rides", rideRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("NUST Carpooling API is running");
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log('API Routes:');
  console.log('- /api/rides');
  console.log('- /api/auth');
  console.log('- /api/contact');
});
