const express = require("express");
const router = express.Router();

//  require contoller module
const game_controller = require("../controllers/gameController");

// book routes
router.get("/", (req, res) => {
  res.redirect("/game/all");
});

router.get("/all", game_controller.game_list);

router.get("/create", game_controller.game_create_get);

router.get("/:id", game_controller.game_detail);

module.exports = router;
