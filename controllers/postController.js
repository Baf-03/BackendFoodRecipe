require("dotenv").config();
const RecipeSchema = require("../models/RecipeSchema");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const UserSchema = require("../models/UserSchema");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});
const verifyuser = async (req, res) => {
  res.json({
    data: null,
    status: true,
    message: "user is verified",
  });
};
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
const UploadImage = async (req, res) => {
  const urls = [];
  console.log("files", req.files);

  if (!req.files.length) {
    return res.json({
      status: true,
      message: "No new image uploaded",
      data: null,
    });
  }

  try {
    for (const file of req.files) {
      console.log("------------", file);
      const path = file.path;
      if (!path) {
        return res.json({
          status: false,
          message: "No new image uploaded",
          data: null,
        });
      }

      if (fs.existsSync(path)) {
        const uploadResult = await cloudinary.uploader.upload(path);
        urls.push(uploadResult.secure_url);
        await unlinkAsync(path); // Delete uploaded files from local storage
      } else {
        console.log("File does not exist at path:", path);
      }
    }

    return res.json({
      status: true,
      message: "Images uploaded",
      data: urls,
    });
  } catch (error) {
    console.error("Error uploading images:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};
const getRecipe = async (req, res) => {
  try {
    const data = await RecipeSchema.find();
    res.json({
      status: true,
      data,
    });
  } catch (err) {
    res.json({
      status: false,
      data: null,
      message: err.message,
    });
  }
};
const createRecipe = async (req, res) => {
  try {
    const { recipeName, ingredients, steps, images, user_id } = req.body;
    if (!recipeName || !ingredients || !steps || !images || !user_id) {
      res.json({
        status: false,
        message: "all fields are required",
        data: null,
      });
      return;
    }
    const objToSend = {
      recipe_name: recipeName,
      ingredients,
      steps,
      images,
      user_id,
    };
    const recipe = await RecipeSchema.create(objToSend);
    res.json({
      status: true,
      message: "Recipe Created",
      data: recipe,
    });
  } catch (err) {
    res.json({
      status: false,
      message: "something went wrong",
      data: null,
    });
  }
};

const searchProject = async (req, res) => {
  try {
    console.log("Query:", req.query.t);
    const searchText = req.query.t;

    // Perform case-insensitive search using regex
    const result = await RecipeSchema.find({
      recipe_name: { $regex: new RegExp(searchText, "i") },
    });

    if (!result || result.length === 0) {
      return res.json({
        status: false,
        message: "No matches found",
        data: null,
      });
    }

    res.json({
      status: true,
      data: result,
    });
  } catch (err) {
    console.log("Error:", err.message);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};
const autocompleteProject = async (req, res) => {
  try {
    console.log(req.query.t);
    const result = await RecipeSchema.aggregate([
      {
        $search: {
          index: "searchInterview",
          autocomplete: {
            query: req.query.t,
            path: "recipe_name",
            fuzzy: {
              maxEdits: 2,
              prefixLength: 0,
              maxExpansions: 50,
            },
          },
        },
      },
    ]);
    res.json({
      data: result,
      message: "congrats",
      status: true,
    });
  } catch (err) {
    console.log("err", err.message);
    res.status(500).json({ status: false, error: err.message });
  }
};

const findrecipe = async (req, res) => {
  const recipeId = req.query.recipe; // Assuming the ID is passed as a query parameter

  if (!recipeId) {
    return res.json({
      status: false,
      message: "No recipe ID provided",
      data: null,
    });
  }

  try {
    const recipe = await RecipeSchema.findById(recipeId);

    if (!recipe) {
      return res.json({
        status: false,
        message: "No recipe found with the provided ID",
        data: null,
      });
    }

    return res.json({
      status: true,
      message: "Recipe found",
      data: recipe,
    });
  } catch (error) {
    console.error("Error finding recipe:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

const findRecipeByUserId = async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    res.json({
      message: "req fields are missing",
      data: null,
      status: false,
    });
    return;
  }
  try {
    const findProjects = await RecipeSchema.find({ user_id: userId });
    console.log(findProjects);
    if (!findProjects.length) {
      res.json({
        message: "no projects found",
        data: null,
        status: false,
      });
      return;
    }
    res.json({
      message: "find projects",
      data: findProjects,
      status: true,
    });
  } catch (err) {
    res.json({
      message: "something went wrong",
      data: null,
      status: false,
    });
  }
};

const checkfavorites = async (req, res) => {
  const { userId, projectId } = req.body;
  if (!userId || !projectId) {
    res.json({
      status: false,
      data: null,
      message: "required fields are required",
    });
    return;
  }
  const finduser = await UserSchema.findById(userId);
  console.log("what is ", finduser?.favorites);
  const isProjectInFavorites = finduser?.favorites?.includes(projectId);
  if (!isProjectInFavorites) {
    res.json({
      data: null,
      status: false,
      message: "project is not in favorites lists",
    });
    return;
  }
  res.json({
    data: isProjectInFavorites,
    status: true,
    message: "project is in favorites lists",
  });
};

const addtoFavoraites = async (req, res) => {
  const { userId, favorites, projectId } = req.body;
  console.log("favorites", favorites);
  if (!userId || typeof favorites !== "boolean" || !projectId) {
    res.json({
      status: false,
      data: null,
      message: "required fields are required",
    });
    return;
  }
  console.log(userId);
  const finduser = await UserSchema.findById(userId);
  console.log("what is ", finduser?.favorites);

  if (favorites) {
    finduser.favorites = finduser?.favorites?.filter((id) => id !== projectId);
    await finduser.save();
  } else {
    console.log("projectid", projectId);
    finduser?.favorites.push(projectId);
    await finduser.save();
  }
  res.json({
    status: true,
    data: finduser,
  });
};

const getmyfavorites = async (req, res) => {
  const { userId } = req.body;
  console.log(userId);
  if (!userId) {
    res.json({
      data: null,
      status: true,
    });
    return;
  }
  const finduser = await UserSchema.findById(userId);
  const arr = [];
  console.log("what is", finduser?.favorites);
  await Promise.all(
    finduser?.favorites?.map(async (element, index) => {
      const recipeData = await RecipeSchema.findById(element);
      console.log(recipeData);
      arr.push(recipeData);
    })
  );
  console.log(arr);
  res.json({
    data: arr,
    status: true,
  });
};

module.exports = {
  verifyuser,
  createRecipe,
  searchProject,
  autocompleteProject,
  getRecipe,
  UploadImage,
  findrecipe,
  findRecipeByUserId,
  addtoFavoraites,
  checkfavorites,
  getmyfavorites,
};
