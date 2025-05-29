const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const activitySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    activityType: {
      type: String,
    },
    date: {
      type: [Date],
    },
    capacity: {
      type: Number,
    },
    price: {
      type: Number,
    },
    location: {
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
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Activity", activitySchema); 