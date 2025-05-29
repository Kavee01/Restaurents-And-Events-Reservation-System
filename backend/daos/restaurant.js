const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// import related daos (to facilitate retrieval of idUser in schemaUser and idBooking in schemaBooking)
// const userDao = require("./user");
// const bookingDao = require("./booking");

/* Sample CREATE format
{
    "image": "testURL", //to update - https://media.istockphoto.com/id/157440843/photo/traditional-japanese-restaurant.jpg?s=612x612&w=0&k=20&c=0-Qmluxn5MaccmJjPML5DquRrqgnIZVQEuf8c7RKp9c=
    "name":"testsample",
    "category": "Japanese",
    "location": "East",
    "timeOpen": 1100,
    "timeClose": 2000,
    "address":"59 Devon Road Singapore 777888",
    "phone":"88997788",
    "websiteUrl":"www.testestes.com",
    "maxPax":30,
    "description":"mid-tier jap restaurant in midtown",
    "coordinates": {
      "lat": 6.0535,
      "lng": 80.2210
    }
    } */

const restaurantSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  images: [{
    type: String,
    required: true,
  }],
  menuPdf: {
    type: String,
    default: null,
  },
  previewImageIndex: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: function(v) {
        return v < this.images.length;
      },
      message: 'Preview image index must be less than the number of images'
    }
  },
  category: {
    type: String,
    enum: ["Asian", "Chinese", "Japanese", "Western"],
    required: true,
  },
  location: {
    type: String,
    enum: [
      "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
      "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
      "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
      "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
      "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya",
      "North", "South", "East", "West", "Central" // Keep original values for backward compatibility
    ],
    required: true,
  },
  timeOpen: {
    type: Number,
    required: true,
  },
  timeClose: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  coordinates: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  daysClose: [{
    type: String,
  }],
  phone: {
    type: String,
  },
  websiteUrl: {
    type: String,
  },
  maxPax: {
    type: Number,
    required: true,
    min: 1,
  },
  description: {
    type: String,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

restaurantSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compile schema into model and export it
module.exports = mongoose.model("Restaurant", restaurantSchema);
