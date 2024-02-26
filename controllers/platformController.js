const Platform = require("../models/platform");
const Game = require("../models/game");
const asyncHandler = require("express-async-handler");

exports.platform_list = asyncHandler(async (req, res, next) => {
  const platforms = await Platform.find({}).sort({ name: 1 }).exec();

  res.render("platform_list", { title: "Platform List", platforms: platforms });
});

exports.platform_detail = asyncHandler(async (req, res, next) => {
  const [platform, allGamesByPlatform] = await Promise.all([
    Platform.findById(req.params.id).exec(),
    Game.find({ platform: req.params.id })
      .sort({ title: 1 })
      .populate("title")
      .exec(),
  ]);

  res.render("platform_detail", {
    title: platform.name,
    games: allGamesByPlatform,
  });
});
