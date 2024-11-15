let bcryptjs = require("bcryptjs");
const nodemailer = require("nodemailer");
const fs = require("fs/promises");
const path = require("path");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { generateAccessToken } = require("../config/accessToken");
const uri =
  "mongodb+srv://mhd:123456789**@platform.kej71.mongodb.net/?retryWrites=true&w=majority&appName=platform";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const db = client.db("global");
// require('dotenv').config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});
// ******************
// Rols
const userCollection = db.collection("user");
const patientCollection = db.collection("patient");
const adminCollection = db.collection("admin");
const doctorCollection = db.collection("doctor");
const pharmacistCollection = db.collection("pharmacist");
// ***********
const appointmentCollection = db.collection("appointment");
const sessionCollection = db.collection("session");
const invoiceCollection = db.collection("invoice");
const prescriptionCollection = db.collection("prescription");
const medicationCollection = db.collection("medication");
const reviewCollection = db.collection("review");
const blogCollection = db.collection("blog");

async function connectToDatabase() {
  try {
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
      console.log("Connected to MongoDB");
    }
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
}
exports.userRegister = async (req, res) => {
  const {
    feeling,
    challenges,
    areas,
    prev_therapy,
    self_harm,
    illness,
    life_changes,
    name,
    email,
    password,
    phone,
    age,
    gender,
  } = req.body;
  if (
    feeling &&
    challenges &&
    areas &&
    prev_therapy &&
    self_harm &&
    illness &&
    life_changes &&
    name &&
    email &&
    password &&
    phone &&
    age &&
    gender
  ) {
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((col) => col.name);
    const confirmationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    try {
      await connectToDatabase();
      if (!collectionNames.includes("user")) {
        await db.createCollection("user");
        console.log('Collection "user" created');
      }
      if (!collectionNames.includes("patient")) {
        await db.createCollection("patient");
        console.log('Collection "patient" created');
      }
      console.log("Checking if user exists...");
      const user = await userCollection.findOne({ email });

      if (user) {
        console.log("User already exists");
        return res.status(400).json({ message: "User already exists" });
      }

      console.log("Creating new user...");
      const salt = await bcryptjs.genSalt(10);
      const hashedCode = await bcryptjs.hash(confirmationCode, salt);
      const hashedPassword = await bcryptjs.hash(password, salt);

      const userData = {
        _id: new ObjectId(),
        name,
        email,
        password: hashedPassword,
        hashedCode,
        age,
        gender,
        phone,
        isActive: false,
        avatar: req.file?.filename || "default-avatar.jpg",
        role: "user",
        createdAt: new Date(),
      };
      console.log("userData", userData);
      console.log("Inserting user data into database...");

      const userInsertResult = await userCollection.insertOne(userData);
      console.log("User inserted successfully", userInsertResult);

      const patientData = {
        user_id: userData._id,
        questions: {
          feeling,
          challenges,
          areas,
          prev_therapy,
          self_harm,
          illness,
          life_changes,
          any_medication,
        },
      };
      console.log("Inserting patient data into database...");
      const patientInsertResult = await patientCollection.insertOne(
        patientData
      );
      console.log("Patient data inserted successfully", patientInsertResult);
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Confirmation email",

        text: `Hello ${name},\n\nYour registration code is: ${confirmationCode}\n\nThank you for registering with us!`,
      };

      await transporter.sendMail(mailOptions);
      console.log("Confirmation email sent!");
      console.log("User registered successfully");

      return res.status(200).json({ message: "User registered successfully" });
    } catch (err) {
      console.error("Server error:", err);
      return res.status(500).json({ message: "Server error" });
    } finally {
      await client.close();
    }
  } else {
    console.log("Invalid userData");
    return res.status(400).json({ message: "Invalid userData" });
  }
};
exports.verifyEmail = async (req, res) => {
  const { email, confirmationCode } = req.body;
  try {
    const user = await userCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.confirmationCode === confirmationCode) {
      await userCollection.updateOne(
        { email },
        { $set: { isActive: true }, $unset: { confirmationCode: "" } }
      );

      return res.status(200).json({ message: "Email verified successfully!" });
    } else {
      return res.status(400).json({ message: "Invalid confirmation code" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
exports.register = async (req, res) => {
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map((col) => col.name);
  const { name, email, password, age, gender, phone, role } = req.body;
  try {
    await connectToDatabase();
    if (!collectionNames.includes("user")) {
      await db.createCollection("user");
      console.log('Collection "user" created');
    }
    if (!collectionNames.includes(role)) {
      await db.createCollection(role);
      console.log(`Collection ${role} created`);
    }

    const user = await userCollection.findOne({ email });
    if (user) {
      console.log("User already exists");
      return res.status(400).json({ message: "User already exists" });
    }

    console.log("Creating new user...");
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const userData = {
      _id: new ObjectId(),
      name,
      email,
      password: hashedPassword,
      age,
      gender,
      phone,
      avatar: req.file?.filename || "default-avatar.jpg",
      role: "user",
      isActive: false,
      createdAt: new Date(),
    };
    console.log("Inserting user data into database...");
    const userInsertResult = await userCollection.insertOne(userData);
    console.log("Patient data inserted successfully", userInsertResult);
    if (role == "admin") {
      const adminData = {
        user_id: userData._id,
        Job_title: "admin",
      };
      console.log("Inserting admin data into database...");
      const adminInsertResult = await adminCollection.insertOne(adminData);
      console.log("admin data inserted successfully", adminInsertResult);
    } else if (role == "patient") {
      const patientData = {
        user_id: userData._id,
        questions: {
          feeling,
          challenges: [],
          areas: [],
          prev_therapy,
          self_harm,
          illness: [],
          life_changes,
          any_medication: [],
        },
      };
      console.log("Inserting patient data into database...");
      const patientInsertResult = await patientCollection.insertOne(
        patientData
      );
      console.log("Patient data inserted successfully", patientInsertResult);
    } else if (role == "doctor") {
      const doctorData = {
        user_id: userData._id,
        specialization: "",
        headLine: "",
        session_price: "",
        availableTime: [""],
      };
      console.log("Inserting doctor data into database...");
      const doctorInsertResult = await doctorCollection.insertOne(doctorData);
      console.log("doctor data inserted successfully", doctorInsertResult);
    } else if (role == "pharmacist") {
      const pharmacistData = {
        user_id: userData._id,
        Job_title: "pharmacist",
      };
      console.log("Inserting pharmacist data into database...");
      const pharmacistInsertResult = await pharmacistCollection.insertOne(
        pharmacistData
      );
      console.log(
        "pharmacist data inserted successfully",
        pharmacistInsertResult
      );
    }

    console.log("User registered successfully");

    return res.status(200).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// للتحقق لاحقًا إذا كانت القيمتان متطابقتين
//  const isMatch = await bcrypt.compare(confirmationCode, hashedCode);

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
// exports.logout = (req, res) => {
//   res.cookie("access_token", "", { maxAge: 0 });
//   res.end();
// };
