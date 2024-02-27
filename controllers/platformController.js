const Platform = require("../models/platform");
const Game = require("../models/game");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

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

// display platform create from from on Get
exports.platform_create_get = asyncHandler(async (req, res, next) => {
  res.render("platform_form", { title: "Add Platform" });
});

// handle platform create on POST
exports.platform_create_post = [
  body("name", "platform name should contain at least 2 characters")
    .trim()
    .toLowerCase()
    .isLength({ min: 2 })
    .escape(),
  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    // Extract the validation, errors from a request.
    const errors = validationResult(req);

    const platform = new Platform({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("platform_form", {
        title: "Add Platform",
        platform,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid
      // Check if Platform with same name already exists.
      const platfromExist = await Platform.findOne({
        name: req.body.name,
      }).exec();

      if (platfromExist) {
        // Platform exists, redirect to its detail page.
        res.redirect(platfromExist.url);
      } else {
        // New platform save. Redirect to platform detail page.
        await platform.save();
        res.redirect(platform.url);
      }
    }
  }),
];
