const express = require("express");
const router = express.Router();
const Rating = require("../model/rating");

// Create a new rating
router.post("/", async (req, res) => {
  try {
    // console.log(req.body);
    const newRating = await Rating.create(req.body);
    res.status(201).json(newRating);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all ratings
router.get("/", async (req, res) => {
  try {
    const ratings = await Rating.find();
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    const rating = await Rating.find({ productId });
    if (!rating) {
      return res
        .status(404)
        .json({ error: "Rating not found for the product ID" });
    }
    res.json(rating);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/rat/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;

    // Find all ratings for the specified product ID
    const ratings = await Rating.find({ productId });

    // If no ratings found, return a message
    if (ratings.length === 0) {
      return res.json({ averageRating: 0, count: ratings.length });
    }

    // Calculate the total sum of ratings
    const totalRating = ratings.reduce((acc, curr) => acc + curr.rating, 0);

    // Calculate the average rating
    const averageRating = totalRating / ratings.length;

    // Return the average rating and count of ratings
    res.json({ averageRating, count: ratings.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Other CRUD endpoints (update, delete) can be added similarly

module.exports = router;
