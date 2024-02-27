const Game = require("../models/game");
const Publisher = require("../models/publisher");
const Platform = require("../models/platform");
const Genre = require("../models/genre");

const asyncHandler = require("express-async-handler");

const { body, validationResult } = require("express-validator");

exports.index = asyncHandler(async (req, res, next) => {
  const numGames = await Game.countDocuments({}).exec();

  res.render("index", {
    title: "Game Store",
    game_count: numGames,
  });
});

exports.game_list = asyncHandler(async (req, res, next) => {
  const games = await Game.find({}, "title publisher year")
    .populate("publisher")
    .exec();

  res.render("game_list", { title: "Games", games: games });
  // res.send("NOT IMPLEMENT: game list");
});

exports.game_detail = asyncHandler(async (req, res, next) => {
  const game = await Game.findById(req.params.id)
    .populate("publisher genre platform")
    .exec();

  if (game === null) {
    const err = new Error("Game not found");
    err.status = 404;
    return next(err);
  }

  res.render("game_detail", { title: game.title, game: game });
  // res.send(`NOT IMPLEMENTED: Game detail: ${req.params.id}`);
});

// Display game create form on GET.
exports.game_create_get = asyncHandler(async (req, res, next) => {
  // Get all publishers, platforms and genres, which we can use for adding to our book.
  const [allPublishers, allPlatforms, allGenres] = await Promise.all([
    Publisher.find().sort({ name: 1 }).exec(),
    Platform.find().sort({ name: 1 }).exec(),
    Genre.find().sort({ name: 1 }).exec(),
  ]);

  res.render("game_form", {
    title: "Add New Game",
    publishers: allPublishers,
    platforms: allPlatforms,
    genres: allGenres,
  });
});
