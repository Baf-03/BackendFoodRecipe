const express = require("express");
const cors = require("cors")
const { default: mongoose } = require("mongoose");
const router = require("./Routes");
require("dotenv").config();

const app = express();
const PORT =5000;
const DB_URI=process.env.DBURI

mongoose.connect(DB_URI)
mongoose.connection.on("connected",()=>{console.log("MONGODB connected")})
mongoose.connection.on("error",()=>{console.log("error connecting to mongo db")})


app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(router)

app.listen(PORT,()=>{
    console.log('http://localhost:5000')
})