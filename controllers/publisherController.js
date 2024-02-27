const Publisher = require("../models/publisher");
const Game = require("../models/game");

const asyncHandler = require("express-async-handler");

// Display list of all Publishers
exports.publisher_list = asyncHandler(async (req, res, next) => {
  const publishers = await Publisher.find({}, "name").sort({ name: 1 }).exec();

  res.render("publisher_list", {
    title: "Publisher list",
    publishers: publishers,
  });
});

// Display publisher detual
exports.publisher_detail = asyncHandler(async (req, res, next) => {
  const [publisher, allGamesByPublisher] = await Promise.all([
    Publisher.findById(req.params.id).exec(),
    Game.find({ publisher: req.params.id })
      .sort({ title: 1 })
      .populate("title")
      .exec(),
  ]);

  if (publisher === null) {
    const error = new Error("Publisher not found");
    error.status = 404;
    return next(error);
  }

  res.render("publisher_detail", {
    title: publisher.name,
    publisher: publisher,
    games: allGamesByPublisher,
  });
});

exports.publisher_create_get = asyncHandler(async (req, res, next) => {
  res.render("publisher_form", { title: "Add New Publisher" });
});
