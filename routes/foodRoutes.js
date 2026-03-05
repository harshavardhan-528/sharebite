const express = require("express");
const router = express.Router();

const foodController = require("../controllers/foodController");
const upload = require("../middleware/upload");

// Donate food with image
router.post(
  "/donate",
  upload.single("image"),
  (req, res, next) => {
    console.log("MULTER HIT");
    next();
  },
  foodController.donateFood
);

// Get all food
router.get("/all", foodController.getAllFood);

// Nearby food
router.get("/nearby", foodController.getNearbyFood);

// Accept food
router.patch("/accept", foodController.acceptFood);

// Update status
router.patch("/status", foodController.updateFoodStatus);

module.exports = router;