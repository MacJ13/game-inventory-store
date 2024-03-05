const Platform = require("../models/platform");
const Game = require("../models/game");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const dotenv = require("dotenv").config();
const debug = require("debug")("platform");

const correctPassword = process.env.SECRET_CODE;

exports.platform_list = asyncHandler(async (req, res, next) => {
  const platforms = await Platform.find({}).sort({ name: 1 }).exec();

  res.render("platform_list", { title: "Platform List", platforms: platforms });
});

exports.platform_detail = asyncHandler(async (req, res, next) => {
  const [platform, allGamesByPlatform] = await Promise.all([
    Platform.findById(req.params.id).exec(),
    Game.find({ platform: req.params.id }).sort({ title: 1 }).exec(),
  ]);

  if (platform === null) {
    debug(`id not found on detail page: ${req.params.id}`);
    const error = new Error("Platform not found");
    error.status = 404;

    return next(error);
  }

  res.render("platform_detail", {
    title: platform.name,
    platform: platform,
    games: allGamesByPlatform,
  });
});

// display platform create from from on Get
exports.platform_create_get = asyncHandler(async (req, res, next) => {
  res.render("platform_form", { title: "Add New Platform" });
});

// handle platform create on POST
exports.platform_create_post = [
  body("name")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage("platform name must not be empty")
    .isLength({ min: 2 })
    .withMessage("Platform name must contain at least 2 characters")
    .custom(async (value) => {
      const platformExists = await Platform.findOne({ name: value });
      if (platformExists) {
        return Promise.reject("Platform already in use");
      }
    }),
  body("password")
    .trim()
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

    const platform = new Platform({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("platform_form", {
        title: "Add New Platform",
        platform,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid
      // Check if Platform with same name already exists.
      await platform.save();
      res.redirect(platform.url);

      // Data from form is valid
      // Check if Platform with same name already exists.
      // const platformExist = await Platform.findOne({
      //   name: req.body.name,
      // }).exec();
      //   if (platformExist) {
      //     // Platform exists, redirect to its detail page.
      //     res.redirect(platformExist.url);
      //   } else {
      //     // New platform save. Redirect to platform detail page.
      //     await platform.save();
      //     res.redirect(platform.url);
      //   }
    }
  }),
];

exports.platform_update_get = asyncHandler(async (req, res, next) => {
  const platform = await Platform.findById(req.params.id).exec();

  if (platform === null) {
    res.redirect("/platform/all");
  }

  res.render("platform_form", { title: "Update Platform", platform: platform });
});

exports.platform_update_post = [
  body("name")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage("Platform name must not be empty")
    .isLength({ min: 2 })
    .withMessage("Platform name must contain at least 2 characters")
    .custom(async (value) => {
      const platformExists = await Platform.findOne({ name: value }).exec();
      if (platformExists) {
        return Promise.reject("Platform already in use");
      }
    }),
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
  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const platform = new Platform({ name: req.body.name, _id: req.params.id });

    if (!errors.isEmpty()) {
      res.render("platform_form", {
        title: "Update Platform",
        platform,
        errors: errors.array(),
      });
      return;
    } else {
      const updatedPlatform = await Platform.findById(req.params.id).exec();
      updatedPlatform.name = platform.name;
      await updatedPlatform.save();

      res.redirect(updatedPlatform.url);
    }
  }),
];

exports.platform_delete_get = asyncHandler(async (req, res, next) => {
  const [platform, allGamesByPlatform] = await Promise.all([
    Platform.findById(req.params.id).exec(),
    Game.find({ platform: req.params.id }).sort({ name: 1 }).exec(),
  ]);

  if (platform === null) {
    res.redirect("/platform/all");
  } else {
    res.render("platform_delete", {
      title: "Delete Platform",
      platform,
      games: allGamesByPlatform,
    });
  }
});

exports.platform_delete_post = [
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password must not be empty")
    .custom((value) => {
      if (correctPassword !== value) {
        throw new Error();
      }

      return true;
    })
    .withMessage("Value does not match secret key"),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    // get body data from delete form int this case it will be id
    const id = req.body.platformid;

    if (!errors.isEmpty()) {
      const [platform, allGamesByPlatform] = await Promise.all([
        Platform.findById(id).exec(),
        Game.find({ platform: id }).sort({ name: 1 }).exec(),
      ]);

      res.render("platform_delete", {
        title: "Delete Platform",
        platform,
        games: allGamesByPlatform,
        errors: errors.array(),
      });
    } else {
      // remove platform from database
      await Platform.deleteOne({ _id: id }).exec();

      // after remove platform we go to platform all view
      res.redirect("/platform/all");
    }
  }),
];
