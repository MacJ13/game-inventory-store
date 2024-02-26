const Publisher = require("../models/publisher");
const asyncHandler = require("express-async-handler");

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
  res.send(`NOT IMPLEMENTED: Author detail: ${req.params.id}`);
});
