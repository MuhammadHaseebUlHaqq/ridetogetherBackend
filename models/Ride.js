const mongoose = require("mongoose");

const RideSchema = mongoose.Schema(
  {
    // Add rider reference at the top
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Route Details
    startingPoint: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    isNustStart: {
      type: Boolean,
      default: false,
    },
    isNustDest: {
      type: Boolean,
      default: false,
    },
    stops: {
      type: [String],
      default: [],
    },

    // Preferences
    rideFrequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "one-time"],
      default: "monthly",
    },
    daysAvailable: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: "At least one day must be selected",
      },
    },
    tripType: {
      type: String,
      enum: ["one-way", "round-trip"],
      default: "round-trip",
    },
    departureTime: {
      type: String,
      required: true,
    },
    returnTime: {
      type: String,
      required: function () {
        return this.tripType === "round-trip";
      },
    },
    price: {
      type: String,
      required: true,
    },

    // Vehicle Info
    vehicleType: {
      type: String,
      enum: ["car", "bike"],
      default: "car",
    },
    vehicleDetails: {
      type: String,
      required: true,
    },
    passengerCapacity: {
      type: String,
      required: function () {
        return this.vehicleType === "car";
      },
    },
    preferences: {
      car: {
        airConditioned: {
          type: Boolean,
          default: false,
        },
        smokingAllowed: {
          type: Boolean,
          default: false,
        },
        petsAllowed: {
          type: Boolean,
          default: false,
        },
        musicAllowed: {
          type: Boolean,
          default: false,
        },
      },
      bike: {
        helmetProvided: {
          type: Boolean,
          default: false,
        },
        rainGearAvailable: {
          type: Boolean,
          default: false,
        },
      },
    },
    additionalInfo: {
      type: String,
    },

    // Contact Details
    userName: {
      type: String,
      required: true,
    },
    studentId: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    isPrimaryWhatsapp: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    preferredContactMethod: {
      type: String,
      enum: ["whatsapp", "call", "sms", "email"],
      default: "whatsapp",
    },
    shareContactConsent: {
      type: Boolean,
      required: true,
      validate: {
        validator: (value) => value === true,
        message: "Contact sharing consent is required",
      },
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },

    // Admin Moderation Fields
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flagReason: {
      type: String,
      default: "",
    },
    moderationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    lastModeratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastModeratedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ride", RideSchema);
