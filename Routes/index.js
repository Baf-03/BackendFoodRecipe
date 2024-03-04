const express = require("express")
const { SignUpController, LoginController } = require("../controllers/authControllers")
const { createRecipe, searchProject, autocompleteProject, getRecipe, verifyuser, UploadImage, findrecipe, findRecipeByUserId, addtoFavoraites, checkfavorites, getmyfavorites } = require("../controllers/postController")
const { authMiddleware } = require("../middleware")
const upload = require("../utils/multer");

const router = express.Router()

router.get("/api/getrecipe",[authMiddleware],getRecipe)
router.get("/api/verifyuser",[authMiddleware],verifyuser)
router.get("/api/findrecipe",[authMiddleware],findrecipe)
router.get("/api/getmyrecipe",[authMiddleware],findRecipeByUserId)

router.post("/api/uploadimage",upload.any("image"),UploadImage)

router.post("/api/signup",SignUpController)
router.post("/api/login",LoginController)

router.post("/api/createrecipe",[authMiddleware],createRecipe)
router.post("/api/addfavorites",[authMiddleware],addtoFavoraites)
router.post("/api/checkfavoritesbyid",[authMiddleware],checkfavorites)
router.post("/api/getallfavorites",[authMiddleware],getmyfavorites)


router.get("/api/searchrecipe",[authMiddleware],searchProject)
router.get("/api/autocompletesearch",[authMiddleware],autocompleteProject)



module.exports=router