const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventBookingSchema = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    numberOfTickets: {
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
    },
    paymentDetails: {
      paypalOrderId: {
        type: String,
      },
      payerEmail: {
        type: String,
      },
      paymentStatus: {
        type: String,
        enum: ['COMPLETED', 'PENDING', 'FAILED'],
      },
      transactionId: {
        type: String,
      },
      paymentDate: {
        type: Date,
        default: Date.now,
      }
    },
    isPaid: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("EventBooking", eventBookingSchema); 