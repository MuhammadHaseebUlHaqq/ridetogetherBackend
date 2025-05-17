const asyncHandler = require("express-async-handler");
const Ride = require("../models/Ride");

// @desc    Create a new ride
// @route   POST /api/rides
// @access  Private
const createRide = asyncHandler(async (req, res) => {
  const {
    startingPoint,
    destination,
    isNustStart,
    isNustDest,
    stops,
    rideFrequency,
    daysAvailable,
    tripType,
    departureTime,
    returnTime,
    price,
    vehicleType,
    vehicleDetails,
    passengerCapacity,
    preferences,
    additionalInfo,
    userName,
    studentId,
    phoneNumber,
    isPrimaryWhatsapp,
    email,
    preferredContactMethod,
    shareContactConsent,
  } = req.body;

  // Validation
  if (!startingPoint || !destination) {
    res.status(400);
    throw new Error("Please provide both starting point and destination");
  }

  if (!isNustStart && !isNustDest) {
    res.status(400);
    throw new Error("At least one location must be NUST campus");
  }

  if (!daysAvailable || daysAvailable.length === 0) {
    res.status(400);
    throw new Error("Please select at least one day");
  }

  if (tripType === "round-trip" && !returnTime) {
    res.status(400);
    throw new Error("Return time is required for round trips");
  }

  if (!shareContactConsent) {
    res.status(400);
    throw new Error("Contact sharing consent is required");
  }

  if (!userName || !studentId || !phoneNumber) {
    res.status(400);
    throw new Error("Please provide your name, student ID, and phone number");
  }

  // Create ride
  const ride = await Ride.create({
    rider: req.user._id,
    startingPoint,
    destination,
    isNustStart,
    isNustDest,
    stops,
    rideFrequency,
    daysAvailable,
    tripType,
    departureTime,
    returnTime,
    price,
    vehicleType,
    vehicleDetails,
    passengerCapacity,
    preferences,
    additionalInfo,
    userName,
    studentId,
    phoneNumber,
    isPrimaryWhatsapp,
    email,
    preferredContactMethod,
    shareContactConsent,
  });

  if (ride) {
    res.status(201).json({
      success: true,
      ride,
    });
  } else {
    res.status(400);
    throw new Error("Invalid ride data");
  }
});

// @desc    Get all rides
// @route   GET /api/rides
// @access  Public
const getRides = asyncHandler(async (req, res) => {
  const rides = await Ride.find({ status: "active" })
    .populate("rider", "firstName lastName email")
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json(rides);
});

// @desc    Get user's rides
// @route   GET /api/rides/myrides
// @access  Private
const getMyRides = asyncHandler(async (req, res) => {
  const rides = await Ride.find({ rider: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(rides);
});

// @desc    Get rides by filter
// @route   GET /api/rides/filter
// @access  Public
const getRidesByFilter = asyncHandler(async (req, res) => {
  const {
    startingPoint,
    destination,
    isNustStart,
    isNustDest,
    daysAvailable,
    departureTime,
    vehicleType,
  } = req.query;

  // Ensure only active rides are returned
  const filter = { status: "active" };

  // Build location search filter
  if (startingPoint && destination) {
    // When both start and destination are provided
    filter.$or = [
      // Direct match of starting point and destination
      {
        startingPoint: { $regex: startingPoint, $options: "i" },
        destination: { $regex: destination, $options: "i" },
      },
      // Starting point direct match and destination in stops
      {
        startingPoint: { $regex: startingPoint, $options: "i" },
        stops: { $elemMatch: { $regex: destination, $options: "i" } },
      },
      // Starting point in stops and destination direct match
      {
        stops: { $elemMatch: { $regex: startingPoint, $options: "i" } },
        destination: { $regex: destination, $options: "i" },
      },
      // Both starting point and destination in stops (different stops)
      {
        stops: {
          $in: [new RegExp(startingPoint, "i"), new RegExp(destination, "i")],
        },
      },
    ];
  } else if (startingPoint) {
    // Only starting point is provided
    filter.$or = [
      { startingPoint: { $regex: startingPoint, $options: "i" } },
      { stops: { $elemMatch: { $regex: startingPoint, $options: "i" } } },
    ];
  } else if (destination) {
    // Only destination is provided
    filter.$or = [
      { destination: { $regex: destination, $options: "i" } },
      { stops: { $elemMatch: { $regex: destination, $options: "i" } } },
    ];
  }

  // Additional filters
  if (isNustStart === "true") {
    filter.isNustStart = true;
  }

  if (isNustDest === "true") {
    filter.isNustDest = true;
  }

  if (daysAvailable) {
    filter.daysAvailable = { $in: daysAvailable.split(",") };
  }

  if (vehicleType) {
    filter.vehicleType = vehicleType;
  }

  const rides = await Ride.find(filter)
    .populate("rider", "firstName lastName email")
    .sort({ createdAt: -1 });

  res.status(200).json(rides);
});

// @desc    Get single ride
// @route   GET /api/rides/:id
// @access  Public
const getRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findById(req.params.id).populate(
    "rider",
    "firstName lastName email"
  );

  if (!ride) {
    res.status(404);
    throw new Error("Ride not found");
  }

  res.json(ride);
});

// @desc    Update ride
// @route   PUT /api/rides/:id
// @access  Private (Ride owner only)
const updateRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findById(req.params.id);

  if (!ride) {
    res.status(404);
    throw new Error("Ride not found");
  }

  // Check if user is the ride owner
  if (ride.rider.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this ride");
  }

  const updatedRide = await Ride.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: false,
  });

  res.json(updatedRide);
});

// @desc    Delete ride
// @route   DELETE /api/rides/:id
// @access  Private (Ride owner only)
const deleteRide = asyncHandler(async (req, res) => {
  try {
    console.log(
      `Delete request for ride ID: ${req.params.id} from user: ${req.user._id}`
    );

    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      console.log("Ride not found");
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });
    }

    // Check ownership
    if (ride.rider.toString() !== req.user._id.toString()) {
      console.log("Unauthorized delete attempt");
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this ride",
      });
    }

    // Delete the ride
    await Ride.findByIdAndDelete(req.params.id);
    console.log("Ride deleted successfully");

    // Send success response
    return res.status(200).json({
      success: true,
      message: "Ride deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteRide:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting ride",
    });
  }
});

// @desc    Get all rides for admin (including inactive)
// @route   GET /api/rides/admin/all
// @access  Private (Admin Only)
const getAdminRides = asyncHandler(async (req, res) => {
  const rides = await Ride.find()
    .populate("rider", "firstName lastName email")
    .populate("lastModeratedBy", "firstName lastName")
    .sort({ createdAt: -1 });

  res.status(200).json(rides);
});

// @desc    Flag a ride for review
// @route   PUT /api/rides/:id/flag
// @access  Private (Admin Only)
const flagRide = asyncHandler(async (req, res) => {
  const { flagReason } = req.body;

  if (!flagReason) {
    res.status(400);
    throw new Error("Flag reason is required");
  }

  const ride = await Ride.findById(req.params.id);

  if (!ride) {
    res.status(404);
    throw new Error("Ride not found");
  }

  // Update only the specific fields needed
  const updatedRide = await Ride.findByIdAndUpdate(
    req.params.id,
    {
      isFlagged: true,
      flagReason: flagReason,
      lastModeratedBy: req.user._id,
      lastModeratedAt: new Date(),
    },
    {
      new: true,
      runValidators: false, // Disable validation to prevent rider field error
    }
  );

  res.status(200).json(updatedRide);
});

// @desc    Update ride moderation status
// @route   PUT /api/rides/:id/moderate
// @access  Private (Admin Only)
const moderateRide = asyncHandler(async (req, res) => {
  const { moderationStatus, adminNotes } = req.body;

  if (!moderationStatus) {
    res.status(400);
    throw new Error("Moderation status is required");
  }

  const ride = await Ride.findById(req.params.id);

  if (!ride) {
    res.status(404);
    throw new Error("Ride not found");
  }

  // Determine if ride should be flagged based on status
  const isFlagged = moderationStatus === "pending";

  // Determine if status should be updated
  const rideStatus =
    moderationStatus === "rejected" ? "cancelled" : ride.status;

  // Create update object
  const updateData = {
    moderationStatus,
    isFlagged,
    status: rideStatus,
    lastModeratedBy: req.user._id,
    lastModeratedAt: new Date(),
  };

  // Add admin notes if provided
  if (adminNotes) {
    updateData.adminNotes = adminNotes;
  }

  const updatedRide = await Ride.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: false,
  });

  res.status(200).json(updatedRide);
});

// @desc    Admin delete ride (bypasses owner check)
// @route   DELETE /api/rides/admin/:id
// @access  Private (Admin Only)
const adminDeleteRide = asyncHandler(async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      res.status(404);
      throw new Error("Ride not found");
    }

    await Ride.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Ride deleted by admin",
      _id: req.params.id,
    });
  } catch (error) {
    console.error("Error in adminDeleteRide:", error);
    res.status(500);
    throw new Error("Failed to delete ride");
  }
});

module.exports = {
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
};
