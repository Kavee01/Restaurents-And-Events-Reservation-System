const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const serviceBookingSchema = new Schema(
  {
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
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
    time: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // in hours
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

module.exports = mongoose.model("ServiceBooking", serviceBookingSchema); 