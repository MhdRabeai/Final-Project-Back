const express = require("express");
const router = express.Router();
const fs = require("fs/promises");
const path = require("path");
const dotenv = require("dotenv");
// const { isUser } = require("./middleware/auth");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
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

module.exports = function (app) {
  app.get("/", isUser, async (req, res) => {
    const data = await fs.readFile(
      path.join(__dirname, "./DB/myjsonfile.json"),
      "utf8"
    );
    const user = JSON.parse(data).find((ele) => ele.name === req.user["name"]);
    res.send(JSON.stringify(user));
  });
  app.get("/download/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "uploads", filename);

    res.download(filePath, (err) => {
      if (err) {
        res.setHeader("error", "File not found");
        return res.status(404).send("File not found");
      }
    });
  });
  app.post("/login", login);
  app.post("/register", upload.single("myfile"), register);
  app.get("/logout", logout);

  // **********************
  // app.get("/register", (req, res) => {
  //   res.sendFile(path.join(__dirname, "/public/signup.html"));
  // });
  // app.get("/login", (req, res) => {
  //   res.sendFile(path.join(__dirname, "/public/sginin.html"));
  // });
  app.get("/counter", counter);
  app.post("/counter/inc", incCounter);
  app.post("/counter/dis", disCounter);
};
