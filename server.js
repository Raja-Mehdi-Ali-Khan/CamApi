const express = require("express");
const mongoose = require("mongoose");
const Event = require("./model/events"); // Assuming eventModel.js contains the schema and database connection
const Rating = require("./model/rating");
const User = require("./model/user");
const Item = require("./model/product");
const Razorpay = require("razorpay");
const multer = require("multer");
const cors = require("cors");
const itemRoutes = require("./routes/itemRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const app = express();
const crypto = require("crypto");
require("dotenv").config();
app.use(cors());
const PORT = process.env.PORT || 5000;
const cloudinary = require("cloudinary").v2;
// Middleware
app.use(express.json());

// Connect to MongoDB  dishantsahuinfy70  pss: ghjsRVEGZnDP8tT9
mongoose
  .connect(
    "mongodb+srv://rajghaznavi:pswrd..00@cluster0.1wf3ruz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Adding this option to avoid deprecation warning
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Routes

app.use("/api/items", itemRoutes);
app.use("/api/rating", ratingRoutes);

app.post("/api/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// Example route
app.get("/", (req, res) => {
  res.send("Hello World!");
});
// import {v2 as cloudinary} from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("image"), function (req, res) {
  cloudinary.uploader.upload(req.file.path, function (err, result) {
    if (err) {
      // console.log(err);
      return res.status(500).json({
        success: false,
        message: "Error",
      });
    }

    res.status(200).json({
      success: true,
      message: "Uploaded!",
      data: result,
    });
  });
});

// Assuming you have other routes defined here for your application

// Create a new event
app.post("/api/events", async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).send(event);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all events
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.send(events);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/get-excluded-intervals/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Find the user by email
    const users = await User.find({ email });

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // For simplicity, assuming there's only one user with a unique email
    const user = users[0];

    // Extract excludedIntervals from the user document
    const excludedIntervals = user.excludedIntervals || [];

    return res.status(200).json(excludedIntervals);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get an event by ID
// Find a user by email
app.get("/api/users/email/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/order", async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = req.body;
    // console.log(options);
    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).send("Error");
    }

    res.json(order);
  } catch (err) {
    // console.log(err);
    res.status(500).send("Error");
  }
});

app.post("/order/validate", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
  //order_id + "|" + razorpay_payment_id
  sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = sha.digest("hex");
  if (digest !== razorpay_signature) {
    return res.status(400).json({ msg: "Transaction is not legit!" });
  }

  res.json({
    msg: "success",
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
  });
});

app.put("/update-excluded-intervals", async (req, res) => {
  try {
    const { email, start, end } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update excludedIntervals
    user.excludedIntervals.push({ start, end });
    await user.save();

    return res
      .status(200)
      .json({ message: "Excluded intervals updated successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Update a user by email
app.put("/api/users/email/:email", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      req.body,
      {
        new: true,
      }
    );
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete an event by ID
app.delete("/api/events/:id", async (req, res) => {
  try {
    const event = await User.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).send({ error: "Event not found" });
    }
    res.send(event);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
