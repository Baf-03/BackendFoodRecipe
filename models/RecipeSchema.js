const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    recipe_name: {
    type: String,
    required: true,
  },
  ingredients: {
    type: String,
    required: true,
  },
  steps: {
    type: [String],
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  user_id:{
    type:String,
    required:true
  }
});

const RecipeSchema = mongoose.model("recipe", schema);
module.exports = RecipeSchema ;
