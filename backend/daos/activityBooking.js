const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const activityBookingSchema = new Schema(
  {
    activity: {
      type: Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    participants: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    specialRequests: {
      type: String,
      maxlength: 200,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending'
    },
    cancellationReason: {
      type: String,
      maxlength: 200
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ActivityBooking", activityBookingSchema); 