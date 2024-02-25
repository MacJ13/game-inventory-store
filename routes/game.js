const express = require("express");
const router = express.Router();

//  require contoller module
const game_controller = require("../controllers/gameController");

// book routes
router.get("/all", game_controller.game_list);

router.get("/:id", game_controller.game_detail);

module.exports = router;
