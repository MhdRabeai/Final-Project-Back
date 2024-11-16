const path = require("path");
const dotenv = require("dotenv");
const express = require("express");
const router = express.Router();
const {
  userRegister,
  register,
  verifyEmail,
  login,
  logout,
} = require("../controller/auth");
const { isLogined } = require("../middleware/auth");
// const { isUser } = require("./middleware/auth");
// const { MongoClient, ServerApiVersion } = require("mongodb");
// const uri =
//   "mongodb+srv://mhd:123456789**@platform.kej71.mongodb.net/?retryWrites=true&w=majority&appName=platform";
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });
dotenv.config();

module.exports = (app) => {
  app.get("/", isLogined, async (req, res) => {
    console.log("access_token", req.user);
    return res.send(200);
    // const user = JSON.parse(data).find((ele) => ele.name === req.user["name"]);
    // res.send(JSON.stringify(user));
  });
  // *******************************************
  // Regetration & Auth
  app.post("/userRegister", upload.single("myfile"), userRegister);
  app.post("/register", upload.single("myfile"), register);
  app.post("/verifyEmail", verifyEmail);
  app.post("/login", login);
  app.get("/logout", logout);
};
