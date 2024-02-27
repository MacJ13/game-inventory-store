const Genre = require("../models/genre");
const Game = require("../models/game");
const asyncHandler = require("express-async-handler");

// display genre list
exports.genre_list = asyncHandler(async (req, res, next) => {
  const genres = await Genre.find({}).sort({ name: 1 }).exec();

  res.render("genre_list", { title: "Genres", genres: genres });
});

// display specific genre
exports.genre_detail = asyncHandler(async (req, res, next) => {
  const [genre, allGamesByGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Game.find({ genre: req.params.id })
      .sort({ title: 1 })
      .populate("title")
      .exec(),
  ]);

  if (genre === null) {
    const error = new Error("Genre not found");
    error.status = 404;

    return next(error);
  }

  res.render("genre_detail", {
    title: genre.name,
    genre: genre,
    games: allGamesByGenre,
  });
});

// display genre create from on Get
exports.genre_create_get = asyncHandler(async (req, res, next) => {
  res.render("genre_form", { title: "Add New Genre" });
});
