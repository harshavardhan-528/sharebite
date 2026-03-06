const express = require("express");
const router = express.Router();

const requestController = require("../controllers/requestController");

router.post("/create",requestController.createRequest);

router.get("/all",requestController.getRequests);

router.patch("/accept",requestController.acceptRequest);

router.patch("/deliver",requestController.markDelivered);

router.delete("/delete",requestController.deleteRequest);

router.get("/nearby",requestController.getNearbyRequests);

module.exports = router;