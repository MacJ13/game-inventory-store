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
    Game.find({ platform: req.params.id }).sort({ title: 1 }).exec(),
  ]);

  res.render("platform_detail", {
    title: platform.name,
    platform: platform,
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
      const platformExist = await Platform.findOne({
        name: req.body.name,
      }).exec();

      if (platformExist) {
        // Platform exists, redirect to its detail page.
        res.redirect(platformExist.url);
      } else {
        // New platform save. Redirect to platform detail page.
        await platform.save();
        res.redirect(platform.url);
      }
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
  body("name", "name must not be empty")
    .toLowerCase()
    .trim()
    .isLength({ min: 2 })
    .escape(),
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

      // if (
      //   updatedPlatform.name.toLowerCase() !== platform.name.toLocaleLowerCase()
      // ) {
      updatedPlatform.name = platform.name;
      await updatedPlatform.save();
      // }

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
      title: "Delete",
      platform,
      games: allGamesByPlatform,
    });
  }
});

exports.platform_delete_post = asyncHandler(async (req, res, next) => {
  // get body data from delete form int this case it will be id
  const id = req.body.platformid;

  // remove platform from database
  await Platform.deleteOne({ _id: id }).exec();

  // after remove platform we go to platform all view
  res.redirect("/platform/all");
});
