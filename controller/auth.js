let bcryptjs = require("bcryptjs");
const nodemailer = require("nodemailer");
require("dotenv").config();
var jwt = require("jsonwebtoken");
const axios = require("axios");
const rateLimit = require("axios-rate-limit");
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
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    // user: "mhd.rabea.naser@gmail.com",
    // pass: "seyy zkav nahk qgdi",
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
  debug: true,
  logger: true,
});

const welcomeMessage = "Hello! I'm your assistant. How can I help you today?";

const predefinedAnswers = {
  "What is depression?":
    "Depression is a mood disorder that causes persistent feelings of sadness, hopelessness, and loss of interest in daily activities. It can affect how you feel, think, and behave.",
  "What are the symptoms of anxiety?":
    "Anxiety symptoms can include constant worry, restlessness, fatigue, difficulty concentrating, and physical symptoms like a rapid heartbeat or sweating.",
  "How can I manage stress?":
    "Stress management techniques include practicing mindfulness, exercising regularly, taking breaks, and talking to a counselor or therapist.",
  "What is PTSD?":
    "Post-Traumatic Stress Disorder (PTSD) is a mental health condition triggered by a terrifying event, causing symptoms like flashbacks, nightmares, and emotional numbness.",

  "How can I register on the site?":
    "To register, click on the 'Sign Up' button, fill in your details, and submit the form. You will receive a confirmation email.",

  "How can I book an appointment?":
    "You can book an appointment by clicking on the 'Book Appointment' button, selecting a date and time, and confirming your booking.",
  "What happens after I book an appointment?":
    "Once your appointment is booked, you will receive a confirmation email with your appointment details.",
};

const predefinedAnswersAr = {
  "ما هو الاكتئاب؟":
    "الاكتئاب هو اضطراب مزاجي يسبب مشاعر مستمرة من الحزن، واليأس، وفقدان الاهتمام بالأنشطة اليومية. يمكن أن يؤثر على مشاعرك، وأفكارك، وتصرفاتك.",
  "ما هي أعراض القلق؟":
    "تتضمن أعراض القلق القلق المستمر، والقلق الزائد، والإرهاق، وصعوبة التركيز، والأعراض الجسدية مثل تسارع ضربات القلب أو التعرق.",
  "كيف يمكنني إدارة التوتر؟":
    "تشمل تقنيات إدارة التوتر ممارسة اليقظة الذهنية، وممارسة الرياضة بانتظام، وأخذ فترات راحة، والتحدث مع مستشار أو معالج.",
  "ما هو اضطراب ما بعد الصدمة؟":
    "اضطراب ما بعد الصدمة هو حالة صحية عقلية ناتجة عن حدث مروع، مما يؤدي إلى أعراض مثل العودة إلى الذكريات المزعجة، وكوابيس، والشعور بالخدر العاطفي.",

  "كيف يمكنني التسجيل في الموقع؟":
    "للتسجيل، اضغط على زر 'التسجيل'، املأ بياناتك، ثم قدم النموذج. ستتلقى رسالة تأكيد على بريدك الإلكتروني.",

  "كيف يمكنني حجز موعد؟":
    "يمكنك حجز موعد بالنقر على زر 'حجز موعد'، ثم اختيار التاريخ والوقت المناسبين، وأخيرًا تأكيد الحجز.",
  "ماذا يحدث بعد حجز الموعد؟":
    "بمجرد حجز الموعد، ستتلقى رسالة تأكيد عبر البريد الإلكتروني تحتوي على تفاصيل الموعد.",
};

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

      // transporter
      //   .sendMail({
      //     from: sender,
      //     to: recipients,
      //     subject: "Confirmation email",
      //     text: `Hello ${name},\n\nYour registration code is: ${confirmationCode}\n\nThank you for registering with us!`,
      //     category: "Integration Test",
      //   })
      //   .then(console.log, console.error);
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

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log(user);
    return res.status(200).json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
exports.doctorProfile = async (req, res) => {
  const { doctorId } = req.query;

  try {
    await connectToDatabase();

    const id = new ObjectId(doctorId);

    const user = await userCollection.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const doctor = await doctorCollection.findOne({ user_id: user["_id"] });
    if (!doctor) {
      return res.status(404).json({ error: "doctor not found" });
    }
    return res.status(200).json({ user, doctor });
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
exports.createPayment = async (req, res) => {
  try {
    const { amount } = req.body; // المبلغ بالدولار * 100
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // تحويل إلى سنتات
      currency: "usd",
      payment_method_types: ["card"],
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
exports.AiPot = async (req, res) => {};
