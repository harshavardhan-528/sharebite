const express = require("express");

const router = express.Router();

const ngoController =
require("../controllers/ngoController");

router.get("/all",ngoController.getNGOs);

module.exports = router;