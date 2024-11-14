const fs = require("fs/promises");
const path = require("path");
const dotenv = require("dotenv");
const router = express.Router();
const { isUser } = require("./middleware/auth");
const { MongoClient, ServerApiVersion } = require("mongodb");
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const { register, login, logout } = require("./controller/auth");
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

module.exports = () => {
  router.get("/", isUser, async (req, res) => {
    const data = await fs.readFile(
      path.join(__dirname, "./DB/myjsonfile.json"),
      "utf8"
    );
    const user = JSON.parse(data).find((ele) => ele.name === req.user["name"]);
    res.send(JSON.stringify(user));
  });
  router.get("/download/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "uploads", filename);

    res.download(filePath, (err) => {
      if (err) {
        res.setHeader("error", "File not found");
        return res.status(404).send("File not found");
      }
    });
  });
  router.post("/login", login);
  router.post("/register", upload.single("myfile"), register);
  router.get("/logout", logout);
};
