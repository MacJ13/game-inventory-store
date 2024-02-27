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

// handle Game create on POST
exports.game_create_post = [
  // Convert the genre to an array
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }

    if (!Array.isArray(req.body.platform)) {
      req.body.platform =
        typeof req.body.platform === "undefined" ? [] : [req.body.platform];
    }

    next();
  },

  // Validate and sanitize fields
  body("title", "Title should contains at least 3 characters.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("publisher", "Publisher must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("year", "Year must not be empty.")
    .trim()
    .isLength({ min: 4, max: 4 })
    .escape(),
  body("price", "Price must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("platform.*").escape(),
  body("genre.*").escape(),
  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    // create a game object with escaped and trimmed data.
    const game = new Game({
      title: req.body.title,
      publisher: req.body.publisher,
      summary: req.body.summary,
      genre: req.body.genre,
      platform: req.body.platform,
      year: Number(req.body.year),
      price: Number(req.body.price),
      number_in_stock: req.body.stocknumber,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all publishers, platforms and genres for form.
      const [allPublishers, allPlatforms, allGenres] = await Promise.all([
        Publisher.find().sort({ name: 1 }).exec(),
        Platform.find().sort({ name: 1 }).exec(),
        Genre.find().sort({ name: 1 }).exec(),
      ]);

      // Mark our selected genres as checked.
      for (const genre of allGenres) {
        if (game.genre.includes(genre._id)) {
          genre.checked = "true";
        }
      }

      for (const platform of allPlatforms) {
        if (game.platform.includes(platform._id)) {
          platform.checked = "true";
        }
      }

      res.render("game_form", {
        title: "Add New Game",
        game: game,
        platforms: allPlatforms,
        publishers: allPublishers,
        genres: allGenres,
        errors: errors.array(),
      });
    } else {
      const gameExists = await Game.findOne({
        title: req.body.title,
        year: Number(req.body.year),
      });
      if (gameExists) {
        res.redirect(gameExists.url);
      } else {
        // Data form is valud. Save game.
        await game.save();
        res.redirect(game.url);
      }
    }
  }),
];

// Display game update form on GET.
exports.game_update_get = asyncHandler(async (req, res, next) => {
  const [game, allPublishers, allPlatforms, allGenres] = await Promise.all([
    Game.findById(req.params.id).exec(),
    Publisher.find().sort({ name: 1 }).exec(),
    Platform.find().sort({ name: 1 }).exec(),
    Genre.find().sort({ name: 1 }).exec(),
  ]);

  if (game === null) {
    const error = new Error("Game not found");
    error.status = 404;
    return next(error);
  }

  for (const genre of allGenres) {
    if (game.genre.includes(genre._id)) {
      genre.checked = "true";
    }
  }

  console.log(allGenres);

  for (const platform of allPlatforms) {
    if (game.platform.includes(platform._id)) {
      platform.checked = "true";
    }
  }

  res.render("game_form", {
    title: "Update Game",
    game: game,
    publishers: allPublishers,
    platforms: allPlatforms,
    genres: allGenres,
  });

  // console.log(game);

  // res.send(req.params.id);
});
