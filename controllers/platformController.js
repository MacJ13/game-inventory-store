const Platform = require("../models/platform");
const asyncHandler = require("express-async-handler");

exports.platform_list = asyncHandler(async (req, res, next) => {
  const platforms = await Platform.find({}).sort({ name: 1 }).exec();

  res.render("platform_list", { title: "Platform List", platforms: platforms });
});

exports.platform_detail = asyncHandler(async (req, res, next) => {
  res.send(`NOT IMPLEMENTED: Platform detail: ${req.params.id}`);
});
