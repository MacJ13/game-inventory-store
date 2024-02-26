const Platform = require("../models/platform");
const asyncHandler = require("express-async-handler");

exports.platform_list = asyncHandler(async (req, res, next) => {
  res.send("Not Implemented Platform list");
});

exports.platform_detail = asyncHandler(async (req, res, next) => {
  res.send(`NOT IMPLEMENTED: Platform detail: ${req.params.id}`);
});
