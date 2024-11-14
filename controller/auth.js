let bcryptjs = require("bcryptjs");
const fs = require("fs/promises");
const path = require("path");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { generateAccessToken } = require("../config/accessToken");
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
exports.userRegister = async (req, res) => {
  const myData = {};
  const { name, email, password, age, gender, Phone, role } = req.body;
  var salt = await bcryptjs.genSalt(10);
  var hashedPassword = await bcryptjs.hash(password, salt);

  Object.assign(myData, {
    name: name,
    email: email,
    password: hashedPassword,
    age: age,
    gender: gender,
    Phone: Phone,
    avatar: req.file?.filename,
    role: role,
    createdAt: Date.now(),
  });
  try {
    const db = client.db("global");
    const userCollection = db.collection("user");
    if (!(await userCollection.findOne({ email: userDoc.email }))) {
      await userCollection.insertOne(myData);
      console.log("User inserted: ", myData);
    }
    res.status(200).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
exports.register = async (req, res) => {
  const userData = {};
  const patientData = {};
  // const { name, email, password, age, gender, Phone,questions } = req.body;
  const { questions } = req.body;
  var salt = await bcryptjs.genSalt(10);
  var hashedPassword = await bcryptjs.hash(password, salt);

  Object.assign(userData, {
    name: name,
    email: email,
    password: hashedPassword,
    age: age,
    gender: gender,
    Phone: Phone,
    avatar: req.file?.filename,
    role: "user",
    createdAt: Date.now(),
  });
  Object.assign(patientData, {
    questions: questions,
  });
  console.log(questions);
  // try {
  //   const db = client.db("global");
  //   const userCollection = db.collection("user");
  //   if (!(await userCollection.findOne({ email: userDoc.email }))) {
  //     await userCollection.insertOne(myData);
  //     console.log("User inserted: ", myData);
  //   }
  //   res.status(200).json({ message: "User registered successfully" });
  // } catch (err) {
  //   res.status(500).json({ message: "Server error" });
  // }
};

exports.login = async (req, res) => {
  const { name, password } = req.body;
  try {
    const data = await fs.readFile(
      path.join(__dirname, "../DB/myjsonfile.json"),
      "utf8"
    );
    const user = await JSON.parse(data).find((ele) => ele.name === name);
    if (!user) {
      res.status(404).send("Invalid Username ");
    }
    const passwordMatched = await bcryptjs.compare(password, user.password);
    if (!passwordMatched) {
      res.status(404).send("Invalid Password");
    }

    const accessToken = generateAccessToken({
      name: user.name,
    });

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: true,
    });

    res.status(200).send("Login successful");
  } catch (err) {
    return res.sendStatus(400);
  }
};
exports.logout = (req, res) => {
  res.cookie("access_token", "", { maxAge: 0 });
  res.end();
};
