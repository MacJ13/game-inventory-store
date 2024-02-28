const express = require("express");
const router = express.Router();

const platform_controller = require("../controllers/platformController");

router.get("/all", platform_controller.platform_list);

router.get("/create", platform_controller.platform_create_get);

router.post("/create", platform_controller.platform_create_post);

router.get("/:id/update", platform_controller.platform_update_get);

router.post("/:id/update", platform_controller.platform_update_post);

router.get("/:id/delete", platform_controller.platform_delete_get);

router.post("/:id/delete", platform_controller.platform_delete_post);

router.get("/:id", platform_controller.platform_detail);

module.exports = router;
