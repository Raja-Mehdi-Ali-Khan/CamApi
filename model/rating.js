// Define schema
const mongoose = require("mongoose");
const eventSchema = new mongoose.Schema({
  rating: { type: Number, required: true },
  productId: { type: String, required: true },
  desc: { type: String },
  userName: { type: String },
  userImage: { type: String },
  count: { type: Number, required: true },
  date: { type: Date, default: Date.now }, // Add Date field with default value
});

// Create model
const Rating = mongoose.model("rating", eventSchema);

module.exports = Rating;
