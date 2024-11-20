const path = require("path");
const dotenv = require("dotenv");
const { findRoomById } = require("../models/Room");
const { getDB } = require("../config/db");
const authMiddleware = require("../middleware/chatAuth");
const { ObjectId } = require("mongodb");
const {
  userRegister,
  register,
  verifyEmail,
  login,
  logout,
  getData,
  doctorProfile,

  createPayment,
  // createFakePayment,
  doctors,
  
  patients,
  patientProfile,
  addPatient,
  deletePatient,
  updatePatient,
  getDoctorPatients,
  createAppointment,
  editAppointment,
  deleteAppointment,
  getInvoices,
  addComment,
  getAppointment,
  getAllAppointments,
  getDoctorInvoices,
  getCommentsByDoctor,
  deleteComment,
  addPrescription,
  getPrescription,
  getAppointmentsByDoctorId,
  addPharmacyInvoice,
  approveInvoice,
  addPrescriptionFromPatient,

} = require("../controller/auth");
const { isLogined } = require("../middleware/auth");
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
  app.get("/", (req, res) => {
    res.status(200).json({ Message: "Hello" });
  });
  app.get("/checkToken", isLogined, getData);
  // *******************************************
  // Regetration & Auth
  app.get("/logout", logout);
  app.get("/doctors", doctors);

  app.get("/patients", patients);
  app.get("/patientProfile?", patientProfile);
  app.post("/addPatient", addPatient);
  app.delete("/deletePatient", deletePatient)
  app.put("/updatePatient", updatePatient)
  app.get("/doctorPatients", getDoctorPatients)

  app.get("/doctorProfile?", doctorProfile);
  app.post("/userRegister", upload.single("myfile"), userRegister);
  app.post("/register", upload.single("myfile"), register);
  app.post("/verifyEmail", verifyEmail);
  app.post("/login", login);

  app.get("/logout", logout);
  app.get("/doctorProfile?", doctorProfile);
  app.post("/process-payment", createPayment);

  // app.post("/process-payment-real", createPayment);
  app.post("/process-payment", createFakePayment);
  app.get("/invoices", getInvoices);
  app.get("/invoices/:id", getDoctorInvoices);
  app.get("/booking", getAllAppointments);
  app.get("/booking/:id", getAppointment);
  app.post("/booking/:id", createAppointment);
  app.patch("/booking/:id", editAppointment);
  app.delete("/booking/:id", deleteAppointment);
  app.get("/booking/doctor/:id", getAppointmentsByDoctorId);
  app.post("/comment/:doctorId", addComment);
  app.get("/comment/:doctorId", getCommentsByDoctor);
  app.delete("/comment/:commentId ", deleteComment);
  app.post("/prescription ", addPrescription);
  app.get("/prescription/:id ", getPrescription);

  // صيدلي
  app.post("/pharmPrescriptions ", addPrescriptionFromPatient);
  // app.post("/pharmPrescriptions/:prescriptionId/invoice", addPharmacyInvoice);
  // app.post("/pharmPrescriptions/:prescriptionId/approve", approveInvoice);

  // app.post("/api/rooms/create", async (req, res) => {
  //   const { name, password } = req.body;
  //   console.log(req.body);
  //   // const userId = req.user.id;

  //   try {
  //     const newRoom = {
  //       name,
  //       // ownerId: "10",
  //       password,
  //       participants: [],
  //     };
  //     const room = await db.collection("rooms").insertOne(newRoom);
  //     console.log(room);
  //     res.status(201).json(room.ops[0]); // ops[0] للحصول على الكائن المحفوظ
  //   } catch (err) {
  //     res.status(500).json({ error: "Failed to create room" });
  //   }
  // });

  // app.post("/api/rooms/join-room/:roomId", authMiddleware, async (req, res) => {
  //   const { roomId } = req.params;
  //   const { password } = req.body; // كلمة المرور هنا
  //   const userId = req.user.id;

  //   try {
  //     const room = await db
  //       .collection("rooms")
  //       .findOne({ _id: new ObjectId(roomId) });
  //     if (!room) return res.status(404).json({ error: "Room not found" });

  //     // التحقق من كلمة مرور الغرفة
  //     if (room.password && room.password !== password) {
  //       return res.status(400).json({ error: "Incorrect password" });
  //     }

  //     // إضافة المستخدم إلى قائمة المشاركين
  //     await db.collection("rooms").updateOne(
  //       { _id: new ObjectId(roomId) },
  //       {
  //         $push: {
  //           participants: {
  //             userId: new ObjectId(userId),
  //             joinedAt: new Date(),
  //           },
  //         },
  //       }
  //     );

  //     res.json({ message: "Successfully joined the room" });
  //   } catch (err) {
  //     res.status(500).json({ error: "Failed to join room" });
  //   }
  // });

  // app.post(
  //   "//api/roomsrequest-access/:roomId",
  //   authMiddleware,
  //   async (req, res) => {
  //     const { roomId } = req.params;
  //     const userId = req.user.id;

  //     try {
  //       const room = await db
  //         .collection("rooms")
  //         .findOne({ _id: new ObjectId(roomId) });
  //       if (!room) return res.status(404).json({ error: "Room not found" });

  //       if (room.ownerId.toString() === userId) {
  //         return res
  //           .status(400)
  //           .json({ error: "You are the owner of the room" });
  //       }

  //       if (room.password) {
  //         // التحقق من كلمة مرور الغرفة
  //         const { password } = req.body;
  //         if (room.password !== password) {
  //           return res.status(400).json({ error: "Incorrect password" });
  //         }
  //       }

  //       // إرسال طلب للوصول إلى الغرفة
  //       await db.collection("room_requests").insertOne({
  //         roomId: new ObjectId(roomId),
  //         userId: new ObjectId(userId),
  //         status: "pending",
  //         createdAt: new Date(),
  //       });

  //       res.json({ message: "Request sent to room owner" });
  //     } catch (err) {
  //       res.status(500).json({ error: "Failed to request access" });
  //     }
  //   }
  // );

  // // مسار للموافقة على طلب الوصول
  // app.post(
  //   "/api/rooms/approve-access/:requestId",
  //   authMiddleware,
  //   async (req, res) => {
  //     const db = getDB();
  //     const { requestId } = req.params;

  //     try {
  //       const request = await db.collection("room_requests").findOne({
  //         _id: new ObjectId(requestId),
  //       });

  //       if (!request)
  //         return res.status(404).json({ error: "Request not found" });

  //       const room = await findRoomById(db, request.roomId);
  //       if (room.ownerId.toString() !== req.user.id) {
  //         return res.status(403).json({ error: "You are not the room owner" });
  //       }

  //       // الموافقة على طلب الوصول
  //       await db
  //         .collection("room_requests")
  //         .updateOne(
  //           { _id: new ObjectId(requestId) },
  //           { $set: { status: "approved" } }
  //         );

  //       await db.collection("rooms").updateOne(
  //         { _id: new ObjectId(request.roomId) },
  //         {
  //           $push: {
  //             participants: { userId: request.userId, joinedAt: new Date() },
  //           },
  //         }
  //       );

  //       res.json({ message: "Access approved" });
  //     } catch (err) {
  //       res.status(500).json({ error: "Failed to approve access" });
  //     }
  //   }
  // );

  // // مسار للخروج من الغرفة
  // app.post(
  //   "/api/rooms/leave-room/:roomId",
  //   authMiddleware,
  //   async (req, res) => {
  //     const db = getDB();
  //     const { roomId } = req.params;
  //     const userId = req.user.id;

  //     try {
  //       const room = await findRoomById(db, roomId);
  //       if (!room) return res.status(404).json({ error: "Room not found" });

  //       // إزالة المستخدم من المشاركين
  //       await db
  //         .collection("rooms")
  //         .updateOne(
  //           { _id: new ObjectId(roomId) },
  //           { $pull: { participants: { userId: new ObjectId(userId) } } }
  //         );

  //       res.json({ message: "Successfully left the room" });
  //     } catch (err) {
  //       res.status(500).json({ error: "Failed to leave room" });
  //     }
  //   }
  // );

  // // مسار لعرض المشاركين في الغرفة
  // app.get(
  //   "/api/rooms/participants/:roomId",
  //   authMiddleware,
  //   async (req, res) => {
  //     const db = getDB();
  //     const { roomId } = req.params;

  //     try {
  //       const room = await findRoomById(db, roomId);
  //       if (!room) return res.status(404).json({ error: "Room not found" });

  //       res.json(room.participants);
  //     } catch (err) {
  //       res.status(500).json({ error: "Failed to fetch participants" });
  //     }
  //   }
  // );
};

// *******************************************************************
// app.post("/api/rooms/create", async (req, res) => {
//   const { name, password } = req.body;
//   console.log(req.body);
//   // const userId = req.user.id;

//   try {
//     const newRoom = {
//       name,
//       // ownerId: "10",
//       password,
//       participants: [],
//     };
//     const room = await db.collection("rooms").insertOne(newRoom);
//     console.log(room);
//     res.status(201).json(room.ops[0]); // ops[0] للحصول على الكائن المحفوظ
//   } catch (err) {
//     res.status(500).json({ error: "Failed to create room" });
//   }
// });

// app.post("/api/rooms/join-room/:roomId", authMiddleware, async (req, res) => {
//   const { roomId } = req.params;
//   const { password } = req.body; // كلمة المرور هنا
//   const userId = req.user.id;

//   try {
//     const room = await db
//       .collection("rooms")
//       .findOne({ _id: new ObjectId(roomId) });
//     if (!room) return res.status(404).json({ error: "Room not found" });

//     // التحقق من كلمة مرور الغرفة
//     if (room.password && room.password !== password) {
//       return res.status(400).json({ error: "Incorrect password" });
//     }

//     // إضافة المستخدم إلى قائمة المشاركين
//     await db.collection("rooms").updateOne(
//       { _id: new ObjectId(roomId) },
//       {
//         $push: {
//           participants: {
//             userId: new ObjectId(userId),
//             joinedAt: new Date(),
//           },
//         },
//       }
//     );

//     res.json({ message: "Successfully joined the room" });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to join room" });
//   }
// });

// app.post(
//   "/roomsrequest-access/:roomId",
//   authMiddleware,
//   async (req, res) => {
//     const { roomId } = req.params;
//     const userId = req.user.id;

//     try {
//       const room = await db
//         .collection("rooms")
//         .findOne({ _id: new ObjectId(roomId) });
//       if (!room) return res.status(404).json({ error: "Room not found" });

//       if (room.ownerId.toString() === userId) {
//         return res
//           .status(400)
//           .json({ error: "You are the owner of the room" });
//       }

//       if (room.password) {
//         // التحقق من كلمة مرور الغرفة
//         const { password } = req.body;
//         if (room.password !== password) {
//           return res.status(400).json({ error: "Incorrect password" });
//         }
//       }

//       // إرسال طلب للوصول إلى الغرفة
//       await db.collection("room_requests").insertOne({
//         roomId: new ObjectId(roomId),
//         userId: new ObjectId(userId),
//         status: "pending",
//         createdAt: new Date(),
//       });

//       res.json({ message: "Request sent to room owner" });
//     } catch (err) {
//       res.status(500).json({ error: "Failed to request access" });
//     }
//   }
// );

// // مسار للموافقة على طلب الوصول
// app.post(
//   "/rooms/approve-access/:requestId",
//   authMiddleware,
//   async (req, res) => {
//     const db = getDB();
//     const { requestId } = req.params;

//     try {
//       const request = await db.collection("room_requests").findOne({
//         _id: new ObjectId(requestId),
//       });

//       if (!request)
//         return res.status(404).json({ error: "Request not found" });

//       const room = await findRoomById(db, request.roomId);
//       if (room.ownerId.toString() !== req.user.id) {
//         return res.status(403).json({ error: "You are not the room owner" });
//       }

//       // الموافقة على طلب الوصول
//       await db
//         .collection("room_requests")
//         .updateOne(
//           { _id: new ObjectId(requestId) },
//           { $set: { status: "approved" } }
//         );

//       await db.collection("rooms").updateOne(
//         { _id: new ObjectId(request.roomId) },
//         {
//           $push: {
//             participants: { userId: request.userId, joinedAt: new Date() },
//           },
//         }
//       );

//       res.json({ message: "Access approved" });
//     } catch (err) {
//       res.status(500).json({ error: "Failed to approve access" });
//     }
//   }
// );

// // مسار للخروج من الغرفة
// app.post(
//   "/rooms/leave-room/:roomId",
//   authMiddleware,
//   async (req, res) => {
//     const db = getDB();
//     const { roomId } = req.params;
//     const userId = req.user.id;

//     try {
//       const room = await findRoomById(db, roomId);
//       if (!room) return res.status(404).json({ error: "Room not found" });

//       // إزالة المستخدم من المشاركين
//       await db
//         .collection("rooms")
//         .updateOne(
//           { _id: new ObjectId(roomId) },
//           { $pull: { participants: { userId: new ObjectId(userId) } } }
//         );

//       res.json({ message: "Successfully left the room" });
//     } catch (err) {
//       res.status(500).json({ error: "Failed to leave room" });
//     }
//   }
// );

// // مسار لعرض المشاركين في الغرفة
// app.get(
//   "/rooms/participants/:roomId",
//   authMiddleware,
//   async (req, res) => {
//     const db = getDB();
//     const { roomId } = req.params;

//     try {
//       const room = await findRoomById(db, roomId);
//       if (!room) return res.status(404).json({ error: "Room not found" });

//       res.json(room.participants);
//     } catch (err) {
//       res.status(500).json({ error: "Failed to fetch participants" });
//     }
//   }
// );
