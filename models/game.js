// require Schema
const mongoose = require("mongoose");

// Define a schema
const Schema = mongoose.Schema;

const GameSchema = new Schema({
  title: {
    type: String,
    required: true,
    lowercase: true,
    minLength: 3,
  },
  publisher: { type: Schema.Types.ObjectId, ref: "Publisher", required: true },
  summary: String,
  genre: [{ type: Schema.Types.ObjectId, ref: "Genre" }],
  platform: [{ type: Schema.Types.ObjectId, ref: "Platform" }],
  year: { type: Number, min: 1990, max: new Date().getFullYear() },
  price: { type: Number, min: 1 },
  number_in_stock: String,
  img_src: String,
});

// Virtual for author's URL
GameSchema.virtual("url").get(function () {
  return `/game/${this._id}`;
});

GameSchema.virtual("img_url").get(function () {
  return `/images/${this.img_src}`;
});

// Export model
module.exports = mongoose.model("Game", GameSchema);
