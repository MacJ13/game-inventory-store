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

router.post("/create", game_controller.game_create_post);

router.get("/:id", game_controller.game_detail);

router.get("/:id/update", game_controller.game_update_get);

module.exports = router;
