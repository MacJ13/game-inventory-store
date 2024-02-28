const express = require("express");
const router = express.Router();

const publisher_controller = require("../controllers/publisherController");

// publisher route

router.get("/all", publisher_controller.publisher_list);

router.get("/create", publisher_controller.publisher_create_get);

router.post("/create", publisher_controller.publisher_create_post);

router.get("/:id/update", publisher_controller.publisher_update_get);

router.post("/:id/update", publisher_controller.publisher_update_post);

router.get("/:id/delete", publisher_controller.publisher_delete_get);

router.post("/:id/delete", publisher_controller.publisher_delete_post);

router.get("/:id", publisher_controller.publisher_detail);

module.exports = router;
