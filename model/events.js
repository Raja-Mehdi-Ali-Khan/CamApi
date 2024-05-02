// Define schema
const mongoose = require("mongoose");
const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  eventType: { type: String },
  pincode: { type: String },
  price: { type: Number },
  profileImage: { type: String },
  experienceVideo: { type: String },
  availability: { type: String },
  about: { type: String },
});

// Create model
const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
