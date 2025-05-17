const express = require("express");
const router = express.Router();
const {
  createRide,
  getRides,
  getMyRides,
  getRidesByFilter,
  getRide,
  updateRide,
  deleteRide,
  getAdminRides,
  flagRide,
  moderateRide,
  adminDeleteRide,
} = require("../controllers/rideController");
const {
  protect,
  isRideOwner,
  isAdmin,
} = require("../middleware/authMiddleware");

// Public routes
router.get("/", getRides);
router.get("/filter", getRidesByFilter);

// Protected routes
router.post("/", protect, createRide);
router.get("/myrides", protect, getMyRides);

// Routes with ride owner check
router.delete("/:id", protect, isRideOwner, deleteRide);

// Admin routes
router.get("/admin/all", protect, isAdmin, getAdminRides);
router.put("/:id/flag", protect, isAdmin, flagRide);
router.put("/:id/moderate", protect, isAdmin, moderateRide);
router.delete("/admin/:id", protect, isAdmin, adminDeleteRide);

// Route with parameter (must be last to avoid conflicts)
router.get("/:id", getRide);
router.put("/:id", protect, isRideOwner, updateRide);

module.exports = router;
