const Genre = require("../models/genre");
const Game = require("../models/game");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const dotenv = require("dotenv").config();

const correctPassword = process.env.SECRET_CODE;

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
  body("name")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage("Genre name must not be empty")
    .isLength({ min: 3 })
    .withMessage("Genre name must contain at least 3 characters")
    .custom(async (value) => {
      const genreExists = await Genre.findOne({ name: value });
      if (genreExists) {
        return Promise.reject("Genre already in use");
      }
    })
    .escape(),
  body("password")
    .notEmpty()
    .withMessage("Password must not be empty")
    .custom((value) => {
      if (correctPassword !== value) {
        throw new Error();
      }
      // Indicates the success of this synchronous custom validator
      return true;
    })
    .withMessage("Value does not match secret key"),

  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    // Extract the validation, errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data;
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty() || !correctPassword) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("genre_form", {
        title: "Add New Genre",
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      // New genre save. Redirect to genre detail page.
      await genre.save();
      res.redirect(genre.url);

      // Data from form is valid
      // Check if Genre with same name already exists.
      // const genreExists = await Genre.findOne({ name: req.body.name }).exec();
      // if (genreExists) {
      //   // Genre exists, redirect to its detail page.
      //   res.redirect(genreExists.url);
      // } else {
      //   await genre.save();
      //   // New genre save. Redirect to genre detail page.
      //   res.redirect(genre.url);
      // }
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
    .toLowerCase()
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

      if (updatedGenre.name !== genre.name) {
        updatedGenre.name = genre.name;
        await updatedGenre.save();
      }

      res.redirect(updatedGenre.url);
    }
  }),
];

exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const [genre, allGamesByGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Game.find({ genre: req.params.id }).sort({ name: 1 }).exec(),
  ]);

  if (genre === null) {
    return res.redirect("/genre/all");
  }

  res.render("genre_delete", {
    title: "Delete Genre",
    genre,
    games: allGamesByGenre,
  });
});

exports.genre_delete_post = [
  body("password")
    .notEmpty()
    .withMessage("Password must not be empty")
    .custom((value) => {
      if (correctPassword !== value) {
        throw new Error();
      }
      // Indicates the success of this synchronous custom validator
      return true;
    })
    .withMessage("Value does not match secret key"),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const id = req.body.genreid;

    if (!errors.isEmpty()) {
      // const genre = await Genre.findById(id).exec();
      const [genre, allGamesByGenre] = await Promise.all([
        Genre.findById(req.params.id).exec(),
        Game.find({ genre: req.params.id }).sort({ name: 1 }).exec(),
      ]);

      res.render("genre_delete", {
        title: "Delete Genre",
        genre,
        games: allGamesByGenre,
        errors: errors.array(),
      });
    } else {
      await Genre.deleteOne({ _id: id }).exec();
      res.redirect("/genre/all");
    }
  }),
];
