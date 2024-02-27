const Publisher = require("../models/publisher");
const Game = require("../models/game");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

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

// handle platform create on POST
exports.publisher_create_post = [
  body("name", "publisher should contain at least 3 characters")
    .trim()
    .toLowerCase()
    .isLength({ min: 3 })
    .escape(),
  body("country", "country should contain at least 3 characters")
    .trim()
    .toLowerCase()
    .isLength({ min: 3 })
    .escape(),
  // Process request after validation and sanitization

  asyncHandler(async (req, res, next) => {
    // Extract the validation, errors from a request.
    const errors = validationResult(req);

    const publisher = new Publisher({
      name: req.body.name,
      country: req.body.country,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("publisher_form", {
        title: "Add New Publisher",
        publisher: publisher,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid
      // Check if Platform with same name already exists.
      const publisherExists = await Publisher.findOne({
        name: req.body.name,
      }).exec();

      if (publisherExists) {
        // Platform exists, redirect to its detail page.
        res.redirect(publisherExists.url);
      } else {
        // New platform save. Redirect to platform detail page.
        await publisher.save();

        res.redirect(publisher.url);
      }
    }
  }),
];
