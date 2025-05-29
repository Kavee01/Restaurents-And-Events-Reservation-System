const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
      required: true,
    },
    ticketPrice: {
      type: Number,
    },
    maxCapacity: {
      type: Number,
      required: true,
    },
    eventType: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", eventSchema); 