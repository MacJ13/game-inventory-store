const express = require("express");
const router = express.Router();

const genre_controller = require("../controllers/genreController");

router.get("/all", genre_controller.genre_list);
router.get("/:id", genre_controller.genre_detail);

module.exports = router;
