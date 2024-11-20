let bcryptjs = require("bcryptjs");
const nodemailer = require("nodemailer");

require("dotenv").config();
var jwt = require("jsonwebtoken");
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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
  debug: true,
  logger: true,
});
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyA2vAY8hwjSSl3-JNrqMfjT4Xnv5bmwwzs");

// ******************
// Rols
const userCollection = db.collection("user");
const patientCollection = db.collection("patient");
const adminCollection = db.collection("admin");
const doctorCollection = db.collection("doctor");
const pharmacistCollection = db.collection("pharmacist");
const drugCollection = db.createCollection("drug");
// ***********
const appointmentCollection = db.collection("appointment");
const sessionCollection = db.collection("session");
const invoiceCollection = db.collection("invoice");
const prescriptionCollection = db.collection("prescription");
const pharmPrescriptionCollection = db.collection("pharmPrescription");
const medicationCollection = db.collection("medication");
const reviewCollection = db.collection("review");
const blogCollection = db.collection("blog");

// ***********************
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
    any_medication,
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
    any_medication &&
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
        user_id: new ObjectId(userData._id),
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
      console.log("email", email);
      console.log("from", process.env.EMAIL);
      console.log("name", name);
      console.log("confirmationCode", confirmationCode);
      const mailOptions = {
        from: "mhd.rabea.naser@gmail.com",
        to: email,
        subject: "Confirmation email",
        text: `Hello ${name},\n\nYour registration code is: ${confirmationCode}\n\nThank you for registering with us!`,
      };
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Error:", err);
        } else {
          console.log("Email sent:", info.response);
        }
      });
      console.log("Confirmation email sent!");
      console.log("User registered successfully");

      return res.status(200).json({ message: "User registered successfully" });
    } catch (err) {
      console.error("Server error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  } else {
    console.log("Invalid userData");
    return res.status(400).json({ message: "Invalid userData" });
  }
};
exports.verifyEmail = async (req, res) => {
  const { email, confirmationCode } = req.body;

  console.log(confirmationCode.join(""));
  try {
    const user = await userCollection.findOne({ email });
    console.log("user", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (typeof user["hashedCode"] !== "string") {
      console.error("The password to compare must be a string.");
    } else {
      bcryptjs.compare(
        confirmationCode.join(""),
        user["hashedCode"],
        async (err, isMatch) => {
          if (err) {
            return `Error comparing password: ${err}`;
          } else {
            await userCollection.updateOne(
              { email },
              { $set: { isActive: true }, $unset: { confirmationCode: "" } }
            );
          }
        }
      );
    }
    console.log("Done");
    return res.status(200).json({ message: "Email verified successfully!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Email verify Faild!!" });
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
      role,
      isActive: false,
      createdAt: new Date(),
    };
    console.log("Inserting user data into database...");
    const userInsertResult = await userCollection.insertOne(userData);
    console.log("Patient data inserted successfully", userInsertResult);
    if (role == "admin") {
      const adminData = {
        user_id: new ObjectId(userData._id),
        Job_title: "admin",
      };
      console.log("Inserting admin data into database...");
      const adminInsertResult = await adminCollection.insertOne(adminData);
      console.log("admin data inserted successfully", adminInsertResult);
    } else if (role == "patient") {
      const patientData = {
        user_id: new ObjectId(userData._id),
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
        user_id: new Object(userData._id),
        specialization: "",
        headLine: "",
        session_price: "",
        experience: "",
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

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userCollection.findOne({ email });
    if (!user) {
      console.log("Invalid email");
      return res.status(404).json({ message: "Invalid email " });
    }
    const passwordMatched = await bcryptjs.compare(password, user.password);
    if (!passwordMatched) {
      console.log("Invalid Password");
      return res.status(404).json({ message: "Invalid Password" });
    }
    if (!user["isActive"]) {
      console.log("isActive");
      return res
        .status(404)
        .json({ message: "You should verify your Account!!" });
    }
    console.log("id in login");
    const accessToken = generateAccessToken({
      id: user["_id"],
      role: user["role"],
    });

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
    });
    console.log("done .. accessToken =>", accessToken);
    return res.status(200).json({ message: "Login successful!!", user: user });
  } catch (err) {
    return res.status(400).json({ message: "Server Error" });
  }
};
exports.logout = (req, res) => {
  console.log("Logout");
  res.cookie("access_token", "", { maxAge: 0 });
  res.end();
};
exports.getData = async (req, res) => {
  try {
    await connectToDatabase();

    if (!req.user || !req.user["id"]) {
      return res.status(400).json({ error: "User ID is missing" });
    }

    const id = new ObjectId(req.user["id"]);
    const user = await userCollection.findOne({ _id: id });

    console.log(user);
    return res.status(200).json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(404);
  }
};

exports.doctorProfile = async (req, res) => {
  const { id } = req.query;

  try {
    await connectToDatabase();

    const doctorId = new ObjectId(id);
    const doctorWithUserDetails = await doctorCollection
      .aggregate([
        {
          $match: { _id: doctorId },
        },
        {
          $lookup: {
            from: "user",
            localField: "user_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
      ])
      .toArray();
    return res.status(200).json({ doctor: doctorWithUserDetails[0] });
  } catch (err) {
    console.error("Error fetching doctor:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//get  patients
exports.patients = async (req, res) => {
  try {
    await connectToDatabase();

    const patients = await userCollection
      .aggregate([
        {
          $match: { role: "patient" },
        },
        {
          $lookup: {
            from: patientCollection.collectionName,
            let: { user_id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$user_id", { $toObjectId: "$$user_id" }] },
                },
              },
            ],
            as: "patientDetails",
          },
        },
        {
          $unwind: {
            path: "$patientDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
      ])
      .toArray();

    console.log("Patients with details:", patients);

    return res.status(200).json({ patients });
  } catch (err) {
    console.error("Error fetching patients:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//add  patient with
// exports.addPatient = async (req, res) => {
//   try {
//     await connectToDatabase();

//     const {
//       name,
//       email,
//       password,
//       age,
//       gender,
//       phone,
//       questions,
//       challenges,
//       areas,
//       prev_therapy,
//       self_harm,
//       illness,
//       life_changes,
//       any_medication,
//     } = req.body;

//     const newUser = {
//       name,
//       email,
//       password,
//       age,
//       gender,
//       phone,
//       avatar,
//       role: "Patient",
//       isActive: true,
//       createdAt: new Date(),
//     };

//     const userResult = await userCollection.insertOne(newUser);

//     const newPatient = {
//       user_id: userResult.insertedId,
//       questions,
//       challenges,
//       areas,
//       prev_therapy,
//       self_harm,
//       illness,
//       life_changes,
//       any_medication,
//     };

//     const patientResult = await patientCollection.insertOne(newPatient);

//     return res.status(201).json({
//       message: "Patient added successfully",
//       patient: { user_id: userResult.insertedId, ...newPatient },
//     });
//   } catch (err) {
//     console.error("Error adding patient:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

exports.addPatient = async (req, res) => {
  const {
    name,
    email,
    password,
    age,
    gender,
    phone,
    questions, // Example field for questions
  } = req.body;

  try {
    await connectToDatabase();

    const newUser = {
      name,
      email,
      password,
      age,
      gender,
      phone,
      avatar: "default-avatar.jpg",
      role: "patient",
      isActive: true,
      createdAt: new Date(),
    };

    const userResult = await userCollection.insertOne(newUser);

    const newPatient = {
      user_id: userResult.insertedId,
      questions,
    };

    const patientResult = await patientCollection.insertOne(newPatient);

    return res.status(201).json({
      message: "Patient added successfully",
      patient: { user_id: userResult.insertedId, ...newPatient },
    });
  } catch (err) {
    console.error("Error adding patient:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete patient with id
exports.deletePatient = async (req, res) => {
  const { id } = req.params;

  try {
    await connectToDatabase();

    const patientId = new ObjectId(id);

    const deleteResult = await patientCollection.deleteOne({ _id: patientId });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    return res.status(200).json({ message: "Patient deleted successfully" });
  } catch (err) {
    console.error("Error deleting patient:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.updatePatient = async (req, res) => {
  const { id } = req.query;
  const updatedData = req.body;

  try {
    await connectToDatabase();

    const patientId = new ObjectId(id);

    const updateResult = await patientCollection.updateOne(
      { _id: patientId },
      { $set: updatedData }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    return res.status(200).json({ message: "Patient updated successfully" });
  } catch (err) {
    console.error("Error updating patient:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get patient with id
exports.patientProfile = async (req, res) => {
  const id = req.params.id;

  try {
    await connectToDatabase();

    const patientId = new ObjectId(id);

    const patientWithUserDetails = await patientCollection
      .aggregate([
        {
          $match: { _id: patientId },
        },
        {
          $lookup: {
            from: "user",
            localField: "user_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
      ])
      .toArray();
    if (patientWithUserDetails.length > 0) {
      return res.status(200).json({ patient: patientWithUserDetails[0] });
    } else {
      return res.status(404).json({ error: "Patient not found" });
    }
  } catch (err) {
    console.error("Error fetching patient:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getDoctorPatients = async (req, res) => {
  const { doctorId } = req.query;

  try {
    await connectToDatabase();

    const doctorObjectId = new ObjectId(doctorId);

    const doctorPatients = await patientCollection
      .aggregate([
        {
          $lookup: {
            from: "doctor",
            localField: "doctor_id",
            foreignField: "_id",
            as: "doctorDetails",
          },
        },
        {
          $unwind: {
            path: "$doctorDetails",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: {
            "doctorDetails._id": doctorObjectId,
          },
        },
        {
          $lookup: {
            from: "user",
            localField: "user_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            questions: 1,
            challenges: 1,
            areas: 1,
            prev_therapy: 1,
            self_harm: 1,
            illness: 1,
            life_changes: 1,
            any_medication: 1,
            userDetails: {
              name: 1,
              email: 1,
              phone: 1,
              age: 1,
              gender: 1,
            },
          },
        },
      ])
      .toArray();

    return res.status(200).json({ patients: doctorPatients });
  } catch (err) {
    console.error("Error fetching doctor patients:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.doctors = async (req, res) => {
  try {
    await connectToDatabase();

    const doctors = await userCollection
      .aggregate([
        {
          $match: { role: "doctor" },
        },
        {
          $lookup: {
            from: doctorCollection.collectionName,
            let: { user_id: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$user_id", { $toObjectId: "$$user_id" }] },
                },
              },
            ],
            as: "doctorDetails",
          },
        },
        {
          $unwind: {
            path: "$doctorDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
      ])
      .toArray();

    console.log("Doctors with details:", doctors);

    return res.status(200).json({ doctors });
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// exports.createPayment = async (req, res) => {
//   const { amount } = req.body;

//   try {
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: Math.floor(amount * 100),
//       currency: "usd",
//       payment_method_types: ["card"],
//     });
//     amountHolder = amount;
//     console.log("End Payment");
//     console.log(await paymentIntent.client_secret);
//     res.send({ clientSecret: await paymentIntent.client_secret });
//   } catch (error) {
//     console.log("error Payment");
//     res.status(500).send({ error: error.message });
//   }
// };
exports.createFakePayment = async (req, res) => {
  const { from, to } = req.body;

  try {
    await connectToDatabase();
    const patientWithUserDetails = await patientCollection
      .aggregate([
        {
          $match: { user_id: new ObjectId(from) },
        },
        {
          $lookup: {
            from: "user",
            localField: "user_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            user_id: 1,
            questions: 1,
            "userDetails.name": 1,
            "userDetails.email": 1,
            "userDetails.phone": 1,
            "userDetails.avatar": 1,
            "userDetails.role": 1,
          },
        },
      ])
      .toArray();
    const doctorWithUserDetails = await doctorCollection
      .aggregate([
        {
          $match: { _id: new ObjectId(to) },
        },
        {
          $lookup: {
            from: "user",
            localField: "user_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
      ])
      .toArray();
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((col) => col.name);
    if (!collectionNames.includes("invoice")) {
      await db.createCollection("invoice");
      console.log('Collection "invoice" created');
    }
    const invoiceData = {
      _id: new ObjectId(),
      form: patientWithUserDetails[0]["userDetails"]["_id"],
      patient_name: patientWithUserDetails[0]["userDetails"]["name"],
      to: doctorWithUserDetails[0]["userDetails"]["_id"],
      destination: doctorWithUserDetails[0]["userDetails"]["name"],
      amount: doctorWithUserDetails[0]["session_price"],
      created_at: new Date(),
    };
    console.log("Inserting invoice data into database...");
    const invoicetInsertResult = await invoiceCollection.insertOne(invoiceData);
    console.log("invoice data inserted successfully", invoicetInsertResult);

    res.status(200).json({
      message: "Done",
    });
  } catch (err) {
    return res.status(500).send({ error: error.message });
  }
};
exports.getDoctorInvoices = async (req, res) => {
  const { id } = req.params;
  try {
    const invoices = await invoiceCollection
      .find({ to: new ObjectId(id) })
      .toArray();

    res.status(200).json(invoices);
  } catch (err) {
    console.error("Error fetching invoices:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
exports.getInvoices = async (req, res) => {
  try {
    await connectToDatabase();

    const invoices = await invoiceCollection.find({}).toArray();
    res.status(200).json(invoices);
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await appointmentCollection
      .find({})
      .sort({ selectedTime: 1 })
      .toArray();
    return res.status(200).json(appointments);
  } catch (error) {
    return res.status(500).json({ message: "Error", error });
  }
};
exports.getAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    await connectToDatabase();
    const appointments = await appointmentCollection
      .find({ to: new ObjectId(id) })
      .toArray();
    res.status(200).json(appointments);
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
};
exports.getAppointmentsByDoctorId = async (req, res) => {
  const { id } = req.params;

  try {
    await connectToDatabase();

    const appointments = await appointmentCollection
      .find({ to: new ObjectId(id) })
      .toArray();

    if (appointments.length === 0) {
      return res.status(404).json({ message: "No appointments" });
    }

    res.status(200).json(appointments);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.createAppointment = async (req, res) => {
  const { from, selectedTime, userCondition } = req.body;
  const { id } = req.params;

  try {
    await connectToDatabase();
    const patientWithUserDetails = await patientCollection
      .aggregate([
        {
          $match: { user_id: new ObjectId(from) },
        },
        {
          $lookup: {
            from: "user",
            localField: "user_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            user_id: 1,
            questions: 1,
            "userDetails.name": 1,
            "userDetails.email": 1,
            "userDetails.phone": 1,
            "userDetails.avatar": 1,
            "userDetails.role": 1,
          },
        },
      ])
      .toArray();
    console.log("asdasdasdas", patientWithUserDetails[0]["_id"]);
    const doctorWithUserDetails = await doctorCollection
      .aggregate([
        {
          $match: { _id: new ObjectId(id) },
        },
        {
          $lookup: {
            from: "user",
            localField: "user_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
      ])
      .toArray();
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((col) => col.name);
    if (!collectionNames.includes("appointment")) {
      await db.createCollection("appointment");
      console.log('Collection "appointment" created');
    }
    const appointmentData = {
      _id: new ObjectId(),
      form: patientWithUserDetails[0]["_id"],
      patient_name: patientWithUserDetails[0]["userDetails"]["name"],
      to: doctorWithUserDetails[0]["userDetails"]["_id"],
      doctor_name: doctorWithUserDetails[0]["userDetails"]["name"],
      selectedTime,
      userCondition,
      status: "on_hold",
      created_at: new Date(),
    };
    console.log("object", patientWithUserDetails[0]["_id"]);
    console.log("Inserting patient data into database...");
    const appointmentInsertResult = await appointmentCollection.insertOne(
      appointmentData
    );
    console.log(
      "appointmentt data inserted successfully",
      appointmentInsertResult
    );

    res.status(200).json({
      message: "Done",
    });
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
};
exports.editAppointment = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await connectToDatabase();
    const oldAppointment = await appointmentCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!oldAppointment) {
      return res.status(404).send({ error: "there is no Appointment" });
    }
    const result = await appointmentCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: status } }
    );

    if (result.modifiedCount > 0) {
      const updatedAppointment = await appointmentCollection.findOne({
        _id: new ObjectId(id),
      });
      res.status(200).json({
        data: updatedAppointment,
      });
    } else {
      res.status(404).json({ message: "Not Found" });
    }
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
};
exports.deleteAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    await connectToDatabase();
    const result = await appointmentCollection.deleteOne({
      _id: new ObjectId(id),
    });
    if (result.deletedCount > 0) {
      res.status(200).json({
        message: "Done",
      });
    } else {
      res.status(404).json({ message: "Not Found" });
    }
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
};
exports.addComment = async (req, res) => {
  const { id } = req.params;
  const { from, comment, rating } = req.body;
  try {
    await connectToDatabase();
    const patientWithUserDetails = await patientCollection
      .aggregate([
        {
          $match: { user_id: new ObjectId(from) },
        },
        {
          $lookup: {
            from: "user",
            localField: "user_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            user_id: 1,
            questions: 1,
            "userDetails.name": 1,
            "userDetails.email": 1,
            "userDetails.phone": 1,
            "userDetails.avatar": 1,
            "userDetails.role": 1,
          },
        },
      ])
      .toArray();
    const newComment = {
      _id: new ObjectId(),
      from: patientWithUserDetails,
      comment: comment,
      rating: rating,
      doctorId: new ObjectId(id),
      createdAt: new Date(),
    };
    const result = await reviewCollection.insertOne(newComment);

    res.status(201).json({
      message: "Comment added successfully",
      comment: result.ops[0],
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.getCommentsByDoctor = async (req, res) => {
  const { id } = req.params;
  try {
    await connectToDatabase();

    const comments = await reviewCollection
      .find({ doctorId: new ObjectId(id) })
      .toArray();

    res.status(200).json(comments);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;
  try {
    await connectToDatabase();

    const result = await reviewCollection.deleteOne({
      _id: new ObjectId(commentId),
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.addPrescription = async (req, res) => {
  const { patient_name, patient_email, doctorId } = req.body;
  // avatar: req.file?.filename
  try {
    await connectToDatabase();
    const patientWithUserDetails = await patientCollection
      .aggregate([
        {
          $match: {
            "userDetails.name": patient_name,
            "userDetails.email": patient_email,
          },
        },
        {
          $lookup: {
            from: "user",
            localField: "user_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            user_id: 1,
            questions: 1,
            "userDetails.name": 1,
            "userDetails.email": 1,
            "userDetails.phone": 1,
            "userDetails.avatar": 1,
            "userDetails.role": 1,
          },
        },
      ])
      .toArray();

    if (patientWithUserDetails.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }
    const newPrescription = {
      _id: new ObjectId(),
      patientId: new ObjectId(patientWithUserDetails[0]._id),
      doctorId: new ObjectId(doctorId),
      prescriptionDetails: req.file?.filename,
      createdAt: new Date(),
    };
    const result = await prescriptionCollection.insertOne(newPrescription);
    res.status(201).json({
      message: "Prescription added successfully",
      prescription: result.ops[0],
    });
  } catch (err) {
    console.error("Error adding prescription:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.getPrescription = async (req, res) => {
  const { id } = req.params;
  try {
    await connectToDatabase();

    const prescription = await prescriptionCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    res.status(200).json(prescription);
  } catch (err) {
    console.error("Error fetching prescription:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
exports.addPrescriptionFromPatient = async (req, res) => {
  const { userId, senderName, senderPhone, senderEmail } = req.body;

  try {
    await connectToDatabase();

    const patientWithUserDetails = await patientCollection
      .aggregate([
        {
          $match: { user_id: new ObjectId(userId) },
        },
        {
          $lookup: {
            from: "user",
            localField: "user_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            user_id: 1,
            questions: 1,
            "userDetails.name": 1,
            "userDetails.email": 1,
            "userDetails.phone": 1,
            "userDetails.avatar": 1,
            "userDetails.role": 1,
          },
        },
      ])
      .toArray();

    if (!patientWithUserDetails) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const prescriptionData = {
      _id: new Date(),
      patientId: new ObjectId(patientWithUserDetails[0]["_id"]),
      senderName: patientWithUserDetails[0]["userDetails"]["name"],
      senderPhone: patientWithUserDetails[0]["userDetails"]["phone"],
      senderEmail: patientWithUserDetails[0]["userDetails"]["email"],
      status: "pending",
      createdAt: new Date(),
    };

    await pharmPrescriptionCollection.insertOne(prescriptionData);
    res.status(201).json({
      message: "Prescription added successfully",
    });
  } catch (err) {
    console.error("Error adding prescription:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
// exports.addPharmacyInvoice = async (req, res) => {
//   const { prescriptionId, invoiceData } = req.body;

// try {
//   await connectToDatabase();
//   const prescription = await pharmPrescriptionCollection.findOne({
//     _id: new ObjectId(prescriptionId),
//   });
//   if (!prescription) {
//     return res.status(404).json({ error: "Prescription not found" });
//   }
//   const updatedPrescription = await prescriptionCollection.updateOne(
//     { _id: new ObjectId(prescriptionId) },
//     {
//       $set: {
//         pharmacyInvoice: invoiceData,
//         status: "awaiting_approval",
//       },
//     }
//   );
//   res.status(200).json({
//     message: "Invoice added and prescription status updated",
//     updatedPrescription,
//   });
// } catch (err) {
//   console.error("Error adding prescription:", err);
//   res.status(500).json({ error: "Internal server error" });
// }
// };
exports.approveInvoice = async (req, res) => {
  const { prescriptionId } = req.params;

  try {
    await connectToDatabase();

    const prescription = await prescriptionCollection.findOne({
      _id: new ObjectId(prescriptionId),
    });
    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" });
    }
    const updatedPrescription = await prescriptionCollection.updateOne(
      { _id: new ObjectId(prescriptionId) },
      {
        $set: {
          status: "approved",
        },
      }
    );
  } catch (err) {
    console.error("Error adding prescription:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllDrugs = async (req, res) => {
  try {
    const drugs = await medicationCollection
      .find({})
      .sort({ name: 1 })
      .toArray();
    return res.status(200).json(drugs);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching drugs", error });
  }
};
exports.getDrugById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const drug = await medicationCollection.findOne({ _id: new ObjectId(id) });

    if (!drug) {
      return res.status(404).json({ message: "Drug not found" });
    }

    return res.status(200).json(drug);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching drug", error });
  }
};
exports.updateDrugById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const result = await medicationCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Check if a document was modified
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Drug not found" });
    }

    return res.status(200).json({ message: "Drug updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating drug", error });
  }
};
exports.deleteDrugById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const result = await medicationCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Drug not found" });
    }

    return res.status(200).json({ message: "Drug deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting drug", error });
  }
};
exports.addNewDrug = async (req, res) => {
  try {
    const newDrug = req.body;

    if (
      !newDrug.name ||
      !newDrug.price ||
      !newDrug.description ||
      !newDrug.stock
    ) {
      return res.status(400).json({
        message: "Missing required fields: name, price, description, stock",
      });
    }

    const result = await medicationCollection.insertOne(newDrug);

    return res.status(201).json({
      message: "Drug added successfully",
      drugId: result.insertedId,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error adding new drug", error });
  }
};
exports.addPharmacyInvoice = async (req, res) => {
  const { prescriptionId, invoiceData } = req.body;

  try {
    await connectToDatabase();
    const prescription = await pharmPrescriptionCollection.findOne({
      _id: new ObjectId(prescriptionId),
    });
    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" });
    }
    const updatedPrescription = await prescriptionCollection.updateOne(
      { _id: new ObjectId(prescriptionId) },
      {
        $set: {
          pharmacyInvoice: invoiceData,
          status: "awaiting_approval",
        },
      }
    );
    res.status(200).json({
      message: "Invoice added and prescription status updated",
      updatedPrescription,
    });
  } catch (err) {
    console.error("Error adding prescription:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
<<<<<<< HEAD

=======
>>>>>>> 2c06d20de0537538f38fc123cc2c5ccf3c79c556
exports.getAllBlogs = async (req, res) => {
  try {
    await connectToDatabase();
    const blogs = await blogCollection.find({}).toArray();
    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Error fetching blogs" });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    await connectToDatabase();
    const blogId = req.params.id;
    const blog = await blogCollection.findOne({ _id: new ObjectId(blogId) });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json(blog);
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ message: "Error fetching blog" });
  }
};

exports.editBlog = async (req, res) => {
  try {
    await connectToDatabase();
    const blogId = req.params.id;
    const updatedData = req.body;

    const result = await blogCollection.updateOne(
      { _id: new ObjectId(blogId) },
      { $set: updatedData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({ message: "Blog updated successfully" });
  } catch (error) {
    console.error("Error editing blog:", error);
    res.status(500).json({ message: "Error editing blog" });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    await connectToDatabase();
    const blogId = req.params.id;

    const result = await blogCollection.deleteOne({
      _id: new ObjectId(blogId),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ message: "Error deleting blog" });
  }
};
<<<<<<< HEAD


exports.createSession = async (req, res) => {
  const { roomName, password, ownerId } = req.body;
  console.log(roomName);
  try {
    const newRoom = {
      _id: new ObjectId(),
      roomName,
      ownerId: new ObjectId(ownerId),
      password,
      participants: [],
    };
    const room = await sessionCollection.insertOne(newRoom);
    console.log(room);
    if (room) {
      console.log("rooooom");
      return res.status(200).json(room);
    }
  } catch (err) {
    console.log("Error", err.message);
    return res.status(500).json({ error: "Failed to create room" });
  }
};
exports.joinRoom = async (req, res) => {
  const { user_id, roomName, password } = req.body;
  try {
    const room = await sessionCollection.findOne({
      roomName,
    });
    if (!room) return res.status(404).json({ error: "Room not found" });

    if (room.password && room.password !== password) {
      return res.status(400).json({ error: "Incorrect password" });
    }
    socket.emit("joinRoom", { roomName, user_id });
    await sessionCollection.updateOne(
      { roomName: roomName },
      {
        $push: {
          participants: {
            user_id: new ObjectId(user_id),
            joinedAt: new Date(),
          },
        },
      }
    );
    res.json({ message: "Successfully joined the room" });
  } catch (err) {
    res.status(500).json({ error: "Failed to join room" });
  }
};

=======
>>>>>>> 2c06d20de0537538f38fc123cc2c5ccf3c79c556
