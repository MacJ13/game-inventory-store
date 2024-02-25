const Game = require("../models/game");

const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  const numGames = await Game.countDocuments({}).exec();

  res.render("index", {
    title: "Game Store",
    game_count: numGames,
  });
});

exports.game_list = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENT: game list");
});

exports.game_detail = asyncHandler(async (req, res, next) => {
  res.send(`NOT IMPLEMENTED: Game detail: ${req.params.id}`);
});
