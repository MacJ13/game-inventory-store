const Publisher = require("../models/publisher");
const Game = require("../models/game");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const dotenv = require("dotenv").config();
const debug = require("debug")("publisher");

const correctPassword = process.env.SECRET_CODE;

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
    debug(`id not found on detail page: ${req.params.id}`);
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
  body("name")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage("Publisher name must not be empty")
    .isLength({ min: 3 })
    .withMessage("publisher should contain at least 3 characters")
    .escape()
    .custom(async (value) => {
      const publisherExists = await Publisher.findOne({ name: value }).exec();
      if (publisherExists) {
        return Promise.reject("Publisher already in use");
      }
    }),
  body("country")
    .trim()
    .toLowerCase()
    .isLength({ min: 3 })
    .withMessage("Country should contain at leat 3 characters")
    .escape(),
  body("password")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage("Secret key must not be empty")
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
      await publisher.save();
      res.redirect(publisher.url);

      // Data from form is valid
      // Check if Platform with same name already exists.
      // const publisherExists = await Publisher.findOne({
      //   name: req.body.name,
      // }).exec();

      // if (publisherExists) {
      //   // Platform exists, redirect to its detail page.
      //   res.redirect(publisherExists.url);
      // } else {
      //   // New platform save. Redirect to platform detail page.
      //   await publisher.save();

      //   res.redirect(publisher.url);
      // }
    }
  }),
];

// Display Publisher update form on GET.
exports.publisher_update_get = asyncHandler(async (req, res, next) => {
  const publisher = await Publisher.findById(req.params.id).exec();

  if (publisher === null) {
    res.redirect("/publisher/all");
  }

  res.render("publisher_form", {
    title: "Update Publisher",
    publisher: publisher,
  });
});

// handle Publisher update on POST
exports.publisher_update_post = [
  body("name")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage("Publisher name must not be empty")
    .isLength({ min: 3 })
    .withMessage("publisher should contain at least 3 characters")
    .escape()
    .custom(async (value) => {
      const publisherExists = await Publisher.findOne({ name: value }).exec();
      if (publisherExists) {
        return Promise.reject("Publisher already in use");
      }
    }),
  body("country")
    .trim()
    .toLowerCase()
    .isLength({ min: 3 })
    .withMessage("Country should contain at leat 3 characters")
    .escape(),
  body("password")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage("Secret key must not be empty")
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

    const publisher = new Publisher({
      name: req.body.name,
      country: req.body.country,
      _id: req.params.id,
    });

    console.log({ publisher });

    if (!errors.isEmpty()) {
      res.render("publisher_form", {
        title: "Update Publisher",
        publisher: publisher,
        errors: errors.array(),
      });

      return;
    } else {
      const updatedPublisher = await Publisher.findById(req.params.id).exec();

      updatedPublisher.name = publisher.name;
      updatedPublisher.country = publisher.country;
      await updatedPublisher.save();
      res.redirect(updatedPublisher.url);
      // if (updatedPublisher.name === publisher.name) {
      //   res.redirect(publisher.url);
      // } else {
      //   updatedPublisher.name = publisher.name;
      //   updatedPublisher.country = publisher.country;
      //   await updatedPublisher.save();

      //   res.redirect(updatedPublisher.url);
      // }
    }
  }),
];

exports.publisher_delete_get = asyncHandler(async (req, res, next) => {
  const [publisher, gamesByPublisher] = await Promise.all([
    Publisher.findById(req.params.id).exec(),
    Game.find({ publisher: req.params.id }, "title").sort({ title: 1 }).exec(),
  ]);

  if (publisher === null) {
    res.redirect("/publisher/all");
  }

  res.render("publisher_delete", {
    title: "Delete Publisher",
    publisher: publisher,
    games: gamesByPublisher,
  });
});

// handle Publisher delete on POST
exports.publisher_delete_post = [
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password must not be empty")
    .escape()
    .custom((value) => {
      if (correctPassword !== value) {
        throw new Error();
      }
      return true;
    })
    .withMessage("Value does not match secret key"),
  asyncHandler(async (req, res, next) => {
    // get body data from delete form int this case it will be id
    const errors = validationResult(req);

    const id = req.body.publisherid;

    if (!errors.isEmpty()) {
      const [publisher, gamesByPublisher] = await Promise.all([
        Publisher.findById(id).exec(),
        Game.find({ publisher: id }, "title").sort({ title: 1 }).exec(),
      ]);

      res.render("publisher_delete", {
        title: "Delete Publisher",
        publisher,
        games: gamesByPublisher,
        errors: errors.array(),
      });
    } else {
      // remove publisher from database
      await Publisher.deleteOne({ _id: id }).exec();
      // after remove publisher we go to publisher all view
      res.redirect("/publisher/all");
    }
  }),
];
