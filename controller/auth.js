let bcryptjs = require("bcryptjs");
const fs = require("fs/promises");
const path = require("path");

const { generateAccessToken } = require("../config/accessToken");
// exports.register = async (req, res) => {
//   const myData = {};
//   const {
//     name,
//     email,
//     password,
//     Phone,
//     location,
//     gender,
//     Language,
//     birthday,
//     detailes,
//     html,
//     css,
//     javaScript,
//     favcolor,
//     old,
//   } = req.body;
//   var salt = await bcryptjs.genSalt(10);
//   var hashedPassword = await bcryptjs.hash(password, salt);

//   Object.assign(myData, {
//     id: uuidv4(),
//     name: name,
//     email: email,
//     password: hashedPassword,
//     Phone: Phone,
//     location: location,
//     gender: gender,
//     favLang: Language,
//     detailes: detailes,
//     webLang: [html, css, javaScript],
//     favcolor: favcolor,
//     birthday: birthday,
//     old: old,
//     fileName: req.file?.filename,
//   });
//   try {
//     const data = await fs.readFile(
//       path.join(__dirname, "../DB/myjsonfile.json"),
//       "utf8"
//     );
//     var obj = JSON.parse(data);
//     obj.push(myData);
//     var allData = JSON.stringify(obj, null, 3);
//     await fs.writeFile(path.join(__dirname, "../DB/myjsonfile.json"), allData);
//     res.status(200).json({ message: "User registered successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };
// exports.login = async (req, res) => {
//   const { name, password } = req.body;
//   try {
//     const data = await fs.readFile(
//       path.join(__dirname, "../DB/myjsonfile.json"),
//       "utf8"
//     );
//     const user = await JSON.parse(data).find((ele) => ele.name === name);
//     if (!user) {
//       res.status(404).send("Invalid Username ");
//     }
//     const passwordMatched = await bcryptjs.compare(password, user.password);
//     if (!passwordMatched) {
//       res.status(404).send("Invalid Password");
//     }

//     const accessToken = generateAccessToken({
//       name: user.name,
//     });

//     res.cookie("access_token", accessToken, {
//       httpOnly: true,
//       secure: true,
//     });

//     res.status(200).send("Login successful");
//   } catch (err) {
//     return res.sendStatus(400);
//   }
// };
exports.logout = (req, res) => {
  res.cookie("access_token", "", { maxAge: 0 });
  res.end();
};
