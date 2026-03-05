const express = require("express");
const router = express.Router();

const requestController =
require("../controllers/requestController");

router.post("/create",requestController.createRequest);

router.get("/all",requestController.getRequests);

router.patch("/accept",requestController.acceptRequest);

module.exports = router;