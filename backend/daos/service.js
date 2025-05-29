const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const serviceSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    serviceType: {
      type: String,
      required: true,
    },
    availability: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    providerInfo: {
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

module.exports = mongoose.model("Service", serviceSchema); 