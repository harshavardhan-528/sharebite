const express = require("express");
const router = express.Router();

const foodController = require("../controllers/foodController");

const multer = require("multer");
const path = require("path");

/* =========================
   MULTER IMAGE UPLOAD
========================= */

const storage = multer.diskStorage({

destination: function(req,file,cb){

cb(null,"public/uploads");

},

filename: function(req,file,cb){

cb(null,Date.now()+path.extname(file.originalname));

}

});

const upload = multer({ storage: storage });


/* =========================
   ROUTES
========================= */

/* Donate food */

router.post(
"/donate",
upload.single("image"),
foodController.donateFood
);

/* Get all food */

router.get(
"/all",
foodController.getAllFood
);

/* Nearby food */

router.get(
"/nearby",
foodController.getNearbyFood
);

/* Accept food */

router.patch(
"/accept",
foodController.acceptFood
);

/* Update food status */

router.patch(
"/status",
foodController.updateFoodStatus
);

module.exports = router;