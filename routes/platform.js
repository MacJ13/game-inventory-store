const express = require("express");
const router = express.Router();

const platform_controller = require("../controllers/platformController");

router.get("/all", platform_controller.platform_list);
router.get("/:id", platform_controller.platform_detail);

module.exports = router;