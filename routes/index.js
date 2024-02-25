const express = require("express");
const router = express.Router();

const game_controller = require("../controllers/gameController");

/* GET home page. */
// router.get("/", function (req, res, next) {
//   res.render("index", { title: "Express" });
// });

router.get("/", game_controller.index);

module.exports = router;
