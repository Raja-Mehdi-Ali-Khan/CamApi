const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  image: {
    type: [String], // Assuming image URLs are stored as strings
    required: true,
  },
  youtube: { type: String }, // Add youtube string field
  pincode: { type: String }, // Add pincode field
  startDate: { type: Date }, // Add Start Date field
  endDate: { type: Date }, // Add End Date field
});

const Item = mongoose.model("product", itemSchema);

module.exports = Item;

// add address
