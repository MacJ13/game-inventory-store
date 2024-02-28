const Genre = require("../models/genre");
const Game = require("../models/game");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

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

// handle Genre create on POST
exports.genre_create_post = [
  // Validate and sanitize the name field.
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .toLowerCase()
    .isLength({ min: 3 })
    .escape(),

  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    // Extract the validation, errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data;
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("genre_form", {
        title: "Add New Genre",
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid
      // Check if Genre with same name already exists.
      const genreExists = await Genre.findOne({ name: req.body.name }).exec();
      if (genreExists) {
        // Genre exists, redirect to its detail page.
        res.redirect(genreExists.url);
      } else {
        await genre.save();
        // New genre save. Redirect to genre detail page.
        res.redirect(genre.url);
      }
    }
  }),
];

exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id).exec();

  if (genre === null) {
    return res.redirect("/genre/all");
  }

  res.render("genre_form", { title: "Update Genre", genre: genre });
});

exports.genre_update_post = [
  body("name", "name should contains at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const genre = new Genre({ name: req.body.name, _id: req.params.id });

    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Update Genre",
        genre,
        errors: errors.array(),
      });
      return;
    } else {
      const updatedGenre = await Genre.findById(req.params.id).exec();

      updatedGenre.name = genre.name;
      await updatedGenre.save();

      res.redirect(updatedGenre.url);
    }
  }),
];
