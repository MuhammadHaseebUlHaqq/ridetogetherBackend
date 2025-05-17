const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Ride = require("../models/Ride");

// Middleware to protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (excluding password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        res.status(401);
        throw new Error("Not authorized, user not found");
      }

      next();
    } catch (error) {
      console.error("Authentication error:", error.message);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }
});

// Middleware to check if user is the owner of the ride
const isRideOwner = asyncHandler(async (req, res, next) => {
  const ride = await Ride.findById(req.params.id);

  if (!ride) {
    res.status(404);
    throw new Error("Ride not found");
  }

  // Check if the logged-in user is the owner of the ride
  if (ride.rider.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to perform this action");
  }

  next();
});

// Middleware to check if user is an admin
const isAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    res.status(403);
    throw new Error("Access denied. Admin privileges required");
  }
  next();
});

module.exports = { protect, isRideOwner, isAdmin };
