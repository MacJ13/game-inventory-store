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
});

// Virtual for author's URL
GameSchema.virtual("url").get(function () {
  return `/catalog/game/${this._id}`;
});

// Export model
module.exports = mongoose.model("Game", GameSchema);
