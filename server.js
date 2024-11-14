const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://mhd:123456789**@platform.kej71.mongodb.net/?retryWrites=true&w=majority&appName=platform";

const app = express();
const path = require("path");
const fs = require("fs/promises");
const usersRouter = require("./Routes/usersRouter");
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
app.use("/", express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use("/apis/v1/users", usersRouter);
app.get("/", (req, res) => {
  res.send("Hello from MERN stack!");
});
app.listen(4000, () => {
  console.log(`Server listening on port ${4000}.`);
});

// async function run() {
//   try {
//     await client.connect();
//     await client.db("global").command({ ping: 1 });
//     console.log(
//       "Pinged your deployment. You successfully connected to MongoDB!"
//     );

//     const db = client.db("global");

//     const collections = await db.listCollections().toArray();
//     const collectionNames = collections.map((col) => col.name);

//     if (!collectionNames.includes("user")) {
//       await db.createCollection("user", {
//         validator: {
//           $jsonSchema: {
//             bsonType: "object",
//             required: [
//               "name",
//               "email",
//               "password",
//               "age",
//               "gender",
//               "phone",
//               "createdAt",
//             ],
//             properties: {
//               // _id: new ObjectId(),
//               avatar: { bsonType: "binData", description: "Must be File" },
//               name: { bsonType: "string", description: "Name Must be String" },
//               email: {
//                 bsonType: "string",
//                 description: "Email Must Be unique",
//               },
//               password: {
//                 bsonType: "string",
//                 description: "Password Must be String",
//               },
//               role: { bsonType: "string", description: "Role Must be String" },
//               age: { bsonType: "int", description: "Age Must be Number" },
//               gender: {
//                 bsonType: "string",
//                 description: "Gender Must be String",
//               },
//               phone: {
//                 bsonType: ["string", "int"],
//                 description: "Phone Must be String or Number",
//               },
//               createdAt: {
//                 bsonType: "date",
//                 description: "createdAt Must be Date",
//               },
//             },
//           },
//         },
//       });
//       await db.collection("user").createIndex({ email: 1 }, { unique: true });
//       console.log(
//         "Collection 'users' created with schema validation and unique index on email!"
//       );
//     }

//     if (!collectionNames.includes("patient")) {
//       await db.createCollection("patient", {
//         validator: {
//           $jsonSchema: {
//             bsonType: "object",
//             required: ["user_id", "questions"],
//             properties: {
//                 // _id: new ObjectId(),
//               user_id: {
//                 bsonType: "string",
//                 description: "user_id Must be String",
//               },
//               questions: {
//                 bsonType: "array",
//                 items: {
//                   bsonType: "object",
//                   properties: {
//                     feeling: {
//                       bsonType: "string",
//                       description: "feeling Must be String",
//                     },
//                     challenges: {
//                       bsonType: "array",
//                       items: {
//                         bsonType: "string",
//                         description: "items Must be String",
//                       },
//                     },
//                     areas: {
//                       bsonType: "array",
//                       description: "areas Must be String",
//                       items: {
//                         bsonType: "string",
//                         description: "items Must be String",
//                       },
//                     },
//                     prev_therapy: {
//                       bsonType: "string",
//                       description: "prev_therapy Must be String",
//                     },
//                     self_harm: {
//                       bsonType: "string",
//                       description: "self_harm Must be String",
//                     },
//                     life_changes: {
//                       bsonType: "string",
//                       description: "life_changes Must be String",
//                     },
//                     any_medication: {
//                       bsonType: "string",
//                       description: "any_medication Must be String",
//                     },
//                     illness: {
//                       bsonType: "array",
//                       description: "illness Must be String",
//                       items: {
//                         bsonType: "string",
//                         description: "items Must be String",
//                       },
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       });
//       await db
//         .collection("patient")
//         .createIndex({ user_id: 1 }, { unique: true });
//       console.log(
//         "Collection 'patient' created with schema validation and unique index on user_id!"
//       );
//     }

//     if (!collectionNames.includes("doctor")) {
//       await db.createCollection("doctor", {
//         validator: {
//           $jsonSchema: {
//             bsonType: "object",
//             required: [
//               "user_id",
//               "specialization",
//               "headLine",
//               "session_price",
//               "availableTime",
//             ],
//             properties: {
//               user_id: {
//                 bsonType: "string",
//                 description: "user_id Must be String",
//               },
//               specialization: {
//                 bsonType: "string",
//                 description: "specialization Must be String",
//               },
//               headLine: {
//                 bsonType: "string",
//                 description: "headLine Must be String",
//               },
//               session_price: {
//                 bsonType: ["string", "number"],
//                 description: "session_price Must be String or Number",
//               },
//               availableTime: {
//                 bsonType: "array",
//                 items: {
//                   bsonType: ["date", "string"],
//                   description: "items Must be Date or String",
//                 },
//               },
//             },
//           },
//         },
//       });
//       await db
//         .collection("doctor")
//         .createIndex({ user_id: 1 }, { unique: true });
//       console.log(
//         "Collection 'doctor' created with schema validation and unique index on user_id!"
//       );
//     }

//     if (!collectionNames.includes("appointment")) {
//       await db.createCollection("appointment", {
//         validator: {
//           $jsonSchema: {
//             bsonType: "object",
//             required: ["patient_id", "doctor_id", "time", "appointmentState"],
//             properties: {
//               patient_id: {
//                 bsonType: "string",
//                 description: "patient_id Must be String",
//               },
//               doctor_id: {
//                 bsonType: "string",
//                 description: "doctor_id Must be String",
//               },
//               time: {
//                 bsonType: "date",
//                 description: "time Must be Date",
//               },
//               sessionLong: {
//                 bsonType: "naumber",
//                 description: "sessionLong Must be Date",
//               },
//               appointmentState: {
//                 bsonType: "string",
//                 description: "state Must be String",
//               },
//             },
//           },
//         },
//       });
//       await db
//         .collection("appointment")
//         .createIndex({ patient_id: 1 }, { unique: true });
//       console.log(
//         "Collection 'patient' created with schema validation and unique index on user_id!"
//       );
//       console.log(
//         "Collection created with schema validation and unique index on email!"
//       );
//     }
//     if (!collectionNames.includes("session")) {
//       await db.createCollection("session", {
//         validator: {
//           $jsonSchema: {
//             bsonType: "object",
//             required: ["patient_id", "doctor_id", "time", "appointmentState"],
//             properties: {
//               patient_id: {
//                 bsonType: "string",
//                 description: "patient_id Must be String",
//               },
//               doctor_id: {
//                 bsonType: "string",
//                 description: "doctor_id Must be String",
//               },
//               time: {
//                 bsonType: "date",
//                 description: "time Must be Date",
//               },
//               isPaid: {
//                 bsonType: "boolean",
//                 description: "isPaid Must be boolean",
//               },
//             },
//           },
//         },
//       });
//       await db
//         .collection("session")
//         .createIndex({ patient_id: 1 }, { unique: true });
//       console.log(
//         "Collection created with schema validation and unique index on email!"
//       );
//     }
//     if (!collectionNames.includes("invoice")) {
//       await db.createCollection("invoice", {
//         validator: {
//           $jsonSchema: {
//             bsonType: "object",
//             required: ["from", "to", "amount", "time", "for"],
//             properties: {
//               from: {
//                 bsonType: "string",
//                 description: "from Must be String",
//               },
//               to: {
//                 bsonType: "string",
//                 description: "to Must be String",
//               },
//               amount: {
//                 bsonType: ["string", "number"],
//                 description: "amount Must be String or Number",
//               },
//               tax: {
//                 bsonType: "string",
//                 description: "tax Must be String or Number",
//               },
//               createdAt: {
//                 bsonType: "date",
//                 description: "createdAt Must be Date",
//               },
//               //For What???
//               for: {
//                 bsonType: "text",
//                 description: "for Must be text",
//               },
//             },
//           },
//         },
//       });
//       await db.collection("invoice").createIndex({ from: 1 }, { unique: true });
//       console.log(
//         "Collection created with schema validation and unique index on email!"
//       );
//     }

//     if (!collectionNames.includes("prescription")) {
//       await db.createCollection("prescription", {
//         validator: {
//           $jsonSchema: {
//             bsonType: "object",
//             required: ["medicines"],
//             properties: {
//               patient_id: {
//                 bsonType: "string",
//                 description: "patient_id Must be String",
//               },
//               doctor_id: {
//                 bsonType: "string",
//                 description: "doctor_id Must be String",
//               },
//               medicines: {
//                 bsonType: "binData",
//                 description: "medicines Must be file",
//               },
//               location: {
//                 bsonType: "string",
//                 description: "location Must be file",
//               },
//               createdAt: {
//                 bsonType: "date",
//                 description: "createdAt Must be Date",
//               },
//             },
//           },
//         },
//       });
//       await db
//         .collection("prescription")
//         .createIndex({ patient_id: 1 }, { unique: true });
//       console.log(
//         "Collection created with schema validation and unique index on email!"
//       );
//     }
//     if (!collectionNames.includes("medication")) {
//       await db.createCollection("medication", {
//         validator: {
//           $jsonSchema: {
//             bsonType: "object",
//             required: ["name", "description", "price", "quantity"],
//             properties: {
//               name: {
//                 bsonType: "string",
//                 description: "medicationName Must be String",
//               },
//               description: {
//                 bsonType: "string",
//                 description: "medicationDescription Must be String",
//               },
//               price: {
//                 bsonType: ["string", "number"],
//                 description: "medicationPrice Must be String or number",
//               },
//               quantity: {
//                 bsonType: ["string", "number"],
//                 description: "medicationQuantity Must be String or number",
//               },
//             },
//           },
//         },
//       });
//       await db
//         .collection("medication")
//         .createIndex({ name: 1 }, { unique: true });
//     }
//     if (!collectionNames.includes("review")) {
//       await db.createCollection("review", {
//         validator: {
//           $jsonSchema: {
//             bsonType: "object",
//             required: [
//               "patient_id",
//               "doctor_id",
//               "content",
//               "rating",
//               "createdAt",
//             ],
//             properties: {
//               patient_id: {
//                 bsonType: "string",
//                 description: "patient_id Must be String",
//               },
//               doctor_id: {
//                 bsonType: "string",
//                 description: "doctor_id Must be String",
//               },
//               content: {
//                 bsonType: "string",
//                 description: "content Must be String",
//               },
//               rating: {
//                 bsonType: "number",
//                 description: "rating Must be String",
//               },
//               createdAt: {
//                 bsonType: "date",
//                 description: "createdAt Must be Date",
//               },
//             },
//           },
//         },
//       });
//       await db
//         .collection("review")
//         .createIndex({ patient_id: 1 }, { unique: true });
//     }
//     if (!collectionNames.includes("blog")) {
//       await db.createCollection("blog", {
//         validator: {
//           $jsonSchema: {
//             bsonType: "object",
//             required: ["doctor_id", "title", "content", "createdAt"],
//             properties: {
//               doctor_id: {
//                 bsonType: "string",
//                 description: "doctor_id Must be String",
//               },
//               title: {
//                 bsonType: "string",
//                 description: "title Must be String",
//               },
//               content: {
//                 bsonType: "string",
//                 description: "content Must be String",
//               },
//               createdAt: {
//                 bsonType: "date",
//                 description: "createdAt Must be Date",
//               },
//             },
//           },
//         },
//       });
//       await db
//         .collection("blog")
//         .createIndex({ doctor_id: 1 }, { unique: true });
//     }
//   } finally {
//     await client.close();
//   }
// }
// run().catch(console.dir);

async function run() {
  try {
    await client.connect();
    await client.db("global").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // const db = client.db("global");
    // const userCollection = db.collection("user");
    // const userDoc = {
    //   name: "John Doe",
    //   email: "johndoe@example.com",
    //   password: "hashedpassword123",
    //   age: 30,
    //   gender: "male",
    //   phone: "1234567890",
    //   createdAt: new Date(),
    // };
    // if (!(await userCollection.findOne({ email: userDoc.email }))) {
    //   await userCollection.insertOne(userDoc);
    //   console.log("User inserted: ", userDoc);
    // }

    // const patientCollection = db.collection("patient");
    // const patientDoc = {
    //   questions: [
    //     {
    //       feeling: "anxious",
    //       challenges: ["work stress", "personal issues"],
    //       areas: ["emotional", "mental health"],
    //       prev_therapy: "CBT",
    //       self_harm: "no",
    //       life_changes: "recent job change",
    //       any_medication: "yes",
    //       illness: ["general anxiety disorder"],
    //     },
    //   ],
    // };
    // if (!(await patientCollection.findOne({ user_id: patientDoc.user_id }))) {
    //   await patientCollection.insertOne(patientDoc);
    //   console.log("Patient inserted: ", patientDoc);
    // }

    // const doctorCollection = db.collection("doctor");
    // const doctorDoc = {
    //   user_id: "doctor123",
    //   specialization: "Psychiatrist",
    //   headLine: "Experienced Psychiatrist specializing in CBT",
    //   session_price: 100,
    //   availableTime: [
    //     new Date("2024-11-15T09:00:00Z"),
    //     new Date("2024-11-15T13:00:00Z"),
    //   ],
    // };
    // if (!(await doctorCollection.findOne({ user_id: doctorDoc.user_id }))) {
    //   await doctorCollection.insertOne(doctorDoc);
    //   console.log("Doctor inserted: ", doctorDoc);
    // }

    // إنشاء مجموعة "appointment"
    // const appointmentCollection = db.collection("appointment");
    // const appointmentDoc = {
    //   patient_id: "patient123",
    //   doctor_id: "doctor123",
    //   time: new Date("2024-11-15T10:00:00Z"),
    //   appointmentState: "scheduled",
    // };

    // await appointmentCollection.insertOne(appointmentDoc);
    // console.log("Appointment inserted: ", appointmentDoc);
    // إنشاء مجموعة "session"
    // const sessionCollection = db.collection("session");
    // const sessionDoc = {
    //   patient_id: "patient123",
    //   doctor_id: "doctor123",
    //   time: new Date("2024-11-15T10:00:00Z"),
    //   isPaid: false,
    // };
    // await sessionCollection.insertOne(sessionDoc);
    // console.log("Session inserted: ", sessionDoc);
    // إنشاء مجموعة "invoice"
    // const invoiceCollection = db.collection("invoice");
    // const invoiceDoc = {
    //   from: "doctor123",
    //   to: "patient123",
    //   amount: 100,
    //   tax: "10%",
    //   createdAt: new Date(),
    //   for: "Therapy Session",
    // };
    // await invoiceCollection.insertOne(invoiceDoc);
    // console.log("Invoice inserted: ", invoiceDoc);

    // إنشاء مجموعة "prescription"
    // const prescriptionCollection = db.collection("prescription");
    // const prescriptionDoc = {
    //   patient_id: "patient123",
    //   doctor_id: "doctor123",
    //   medicines: Buffer.from("medicine data"), // Example binary data for medicines
    //   location: "Prescription Location",
    //   createdAt: new Date(),
    // };
    // await prescriptionCollection.insertOne(prescriptionDoc);
    // console.log("Prescription inserted: ", prescriptionDoc);

    // const medicationCollection = db.collection("medication");
    // const medicationDoc = {
    //   name: "Aspirin",
    //   description: "Pain relief",
    //   price: 20,
    //   quantity: 100,
    // };
    // if (!(await medicationCollection.findOne({ name: medicationDoc.name }))) {
    //   await medicationCollection.insertOne(medicationDoc);
    //   console.log("Medication inserted: ", medicationDoc);
    // }

    // const reviewCollection = db.collection("review");
    // const reviewDoc = {
    //   _id:new ObjectId(),
    //   patient_id: "patient123",
    //   doctor_id: "doctor123",
    //   content: "Great session, very helpful.",
    //   rating: 5,
    //   createdAt: new Date(),
    // };
    // await reviewCollection.insertOne(reviewDoc);
    // console.log("Review inserted: ", reviewDoc);

    // const blogCollection = db.collection("blog");
    // const blogDoc = {
    //   doctor_id: "doctor123",
    //   title: "How CBT Can Help Manage Anxiety",
    //   content:
    //     "Cognitive Behavioral Therapy is one of the most effective treatments for anxiety...",
    //   createdAt: new Date(),
    // };
    // await blogCollection.insertOne(blogDoc);
    // console.log("Blog inserted: ", blogDoc);
  } finally {
    await client.close();
  }
}
run().catch(console.error);
