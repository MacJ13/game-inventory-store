const express = require("express");
const router = express.Router();

const publisher_controller = require("../controllers/publisherController");

// publisher route

router.get("/all", publisher_controller.publisher_list);
router.get("/:id", publisher_controller.publisher_detail);

module.exports = router;
