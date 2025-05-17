const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const OTP = require("../models/OTP");
const {
  sendOTPEmail,
  sendPasswordResetOTPEmail,
} = require("../utils/emailService");
const crypto = require("crypto");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Generate OTP
const generateOTP = () => {
  const otp = crypto.randomInt(100000, 999999).toString();
  console.log("Generated OTP:", otp);
  return otp;
};

// @desc    Send OTP for email verification
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTP = asyncHandler(async (req, res) => {
  console.log("Received send OTP request:", req.body);
  const { email } = req.body;

  if (!email) {
    console.log("Email missing in request");
    res.status(400);
    throw new Error("Email is required");
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    console.log("User already exists with email:", email);
    res.status(400);
    throw new Error("User already exists with this email");
  }

  // Generate OTP
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  console.log("Creating OTP record for email:", email);
  // Save OTP
  await OTP.create({
    email,
    otp,
    expiresAt,
  });

  console.log("Sending OTP email");
  // Send OTP email
  try {
    await sendOTPEmail(email, otp);
    console.log("OTP email sent successfully");
  } catch (error) {
    console.error("Error sending OTP email:", error);
    res.status(500);
    throw new Error("Failed to send OTP email");
  }

  res.status(200).json({
    message: "OTP sent successfully",
  });
});

// @desc    Verify OTP and register user
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTPAndRegister = asyncHandler(async (req, res) => {
  const { firstName, lastName, username, email, password, otp } = req.body;

  // Validate OTP
  const otpRecord = await OTP.findOne({
    email,
    otp,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });

  if (!otpRecord) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  // Check if user already exists
  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists with this email or username");
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    username,
    email,
    password,
  });

  // Mark OTP as used
  otpRecord.isUsed = true;
  await otpRecord.save();

  if (user) {
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Find user by username
  const user = await User.findOne({ username });

  // Check if user exists and password matches
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      phone: user.phone,
      bio: user.bio,
      profilePicture: user.profilePicture,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid username or password");
  }
});

// @desc    Send OTP for password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("No user found with this email");
  }
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await OTP.create({ email, otp, expiresAt });
  await sendPasswordResetOTPEmail(email, otp);
  res.status(200).json({ message: "OTP sent to email for password reset" });
});

// @desc    Verify OTP for password reset
// @route   POST /api/auth/verify-reset-otp
// @access  Public
const verifyResetOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const otpRecord = await OTP.findOne({
    email,
    otp,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });
  if (!otpRecord) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }
  otpRecord.isUsed = true;
  await otpRecord.save();
  res
    .status(200)
    .json({ message: "OTP verified. You can now reset your password." });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const otpRecord = await OTP.findOne({
    email,
    otp,
    isUsed: true, // Must be marked as used by verify-reset-otp
    expiresAt: { $gt: new Date() },
  });
  if (!otpRecord) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("No user found with this email");
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({ message: "Password reset successful. Please login." });
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json(user);
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update user fields
  user.firstName = req.body.firstName || user.firstName;
  user.lastName = req.body.lastName || user.lastName;
  user.phone = req.body.phone || user.phone;
  user.bio = req.body.bio || user.bio;
  user.profilePicture = req.body.profilePicture || user.profilePicture;

  // If password is provided, it will be hashed in the pre-save hook
  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  // Send response without password
  res.status(200).json({
    _id: updatedUser._id,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    username: updatedUser.username,
    email: updatedUser.email,
    isAdmin: updatedUser.isAdmin,
    phone: updatedUser.phone,
    bio: updatedUser.bio,
    profilePicture: updatedUser.profilePicture,
    token: generateToken(updatedUser._id),
  });
});

module.exports = {
  sendOTP,
  verifyOTPAndRegister,
  loginUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  getUserProfile,
  updateUserProfile,
};
