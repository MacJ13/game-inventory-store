const Game = require("../models/game");
const Publisher = require("../models/publisher");
const Platform = require("../models/platform");
const Genre = require("../models/genre");

const fs = require("fs/promises");

const asyncHandler = require("express-async-handler");
const multer = require("multer");

const { body, validationResult } = require("express-validator");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    const [filename, ext] = file.originalname.split(".");

    cb(null, filename + "_" + uniqueSuffix + "." + ext);
  },
});

const upload = multer({ storage: storage });

exports.index = asyncHandler(async (req, res, next) => {
  const numGames = await Game.countDocuments({}).exec();

  res.render("index", {
    title: "Game Store",
    game_count: numGames,
  });
});

exports.game_list = asyncHandler(async (req, res, next) => {
  const games = await Game.find({}, "title publisher year img_src")
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
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  upload.single("image"),
  // Validate and sanitize fields
  body("title", "Title should contains at least 3 characters.")
    .trim()
    .toLowerCase()
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
  body("numberstock", "Number stock must not be empty.")
    .trim()
    .isLength({ min: 3 })
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
      number_in_stock: req.body.numberstock,
      img_src: req.file ? req.file.filename : undefined,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // remove image if req.file exists
      if (req.file) await fs.rm(req.file.path);

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
});

// handle Game update on POST
exports.game_update_post = [
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
  upload.single("image"),
  body("title", "title should contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .unescape(),
  body("publisher", "publisher should not be empty")
    .trim()
    .toLowerCase()
    .escape()
    .unescape(),
  body("summary", "Summary must not be empty.").trim().escape().unescape(),
  body("year", "year should not be empty")
    .trim()
    .isLength({ min: 4, max: 4 })
    .escape(),
  body("price", "price should not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("numberstock", "Number stock must not be empty.")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("platform.*").escape(),
  body("genre.*").escape(),
  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const game = new Game({
      title: req.body.title,
      publisher: req.body.publisher,
      summary: req.body.summary,
      year: Number(req.body.year),
      price: Number(req.body.price),
      number_in_stock: req.body.numberstock,
      platform: req.body.platform === "undefined" ? [] : req.body.platform,
      genre: req.body.genre === "undefined" ? [] : req.body.genre,
      img_src: req.file ? req.file.filename : undefined,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all publishers, platforms and genres for form.
      const [allPublishers, allPlatforms, allGenres] = await Promise.all([
        Publisher.find().sort({ name: 1 }).exec(),
        Platform.find().sort({ name: 1 }).exec(),
        Genre.find().sort({ name: 1 }).exec(),
      ]);

      // remove image if req.file exists
      if (req.file) await fs.rm(req.file.path);

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
        title: "Update game",
        game: game,
        platforms: allPlatforms,
        publishers: allPublishers,
        genres: allGenres,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from is valid. Update the record.
      const updatedGame = await Game.findById(req.params.id).exec();

      updatedGame.publisher = game.publisher;
      updatedGame.title = game.title;
      updatedGame.summary = game.summary;
      updatedGame.year = game.year;
      updatedGame.price = game.price;
      updatedGame.number_in_stock = game.number_in_stock;
      updatedGame.platform = game.platform;
      updatedGame.genre = game.genre;

      if (req.file) {
        await fs.rm(path.join("public", updatedGame.img_url));
        updatedGame.img_src = game.img_src;
      }

      await updatedGame.save();
      res.redirect(updatedGame.url);
    }
  }),
];

// Display Game delete form on GET.
exports.game_delete_get = asyncHandler(async (req, res, next) => {
  const game = await Game.findById(req.params.id).exec();

  if (game === null) {
    res.redirect("/game/all");
  }
  res.render("game_delete", { title: "Delete Game", game: game });
});

// handle Game delete on POST
exports.game_delete_post = asyncHandler(async (req, res, next) => {
  // get body data from delete form int this case it will be id
  const id = req.body.gameid;

  const game = await Game.findById(id).exec();

  // remove image game cover
  if (game.img_src) await fs.rm(path.join("public", game.img_url));

  // remove game from database
  await Game.deleteOne({ _id: game._id }).exec();

  // after remove game we go to game all view
  res.redirect("/game/all");
});
