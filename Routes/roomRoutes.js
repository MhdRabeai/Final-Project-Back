const express = require("express");
const { createRoom, findRoomById, addParticipant } = require("../models/Room");
const { getDB } = require("../config/db");
const authMiddleware = require("../middleware/chatAuth");
const { ObjectId } = require("mongodb");
const router = express.Router();

router.post("/create", authMiddleware, async (req, res) => {
  const { name, password } = req.body;
  const userId = req.user.id;

  try {
    const newRoom = {
      name,
      ownerId: userId,
      password,
      participants: [],
    };
    const room = await db.collection("rooms").insertOne(newRoom);
    res.status(201).json(room.ops[0]); // ops[0] للحصول على الكائن المحفوظ
  } catch (err) {
    res.status(500).json({ error: "Failed to create room" });
  }
});

router.post("/join-room/:roomId", authMiddleware, async (req, res) => {
  const { roomId } = req.params;
  const { password } = req.body; // كلمة المرور هنا
  const userId = req.user.id;

  try {
    const room = await db
      .collection("rooms")
      .findOne({ _id: new ObjectId(roomId) });
    if (!room) return res.status(404).json({ error: "Room not found" });

    // التحقق من كلمة مرور الغرفة
    if (room.password && room.password !== password) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    // إضافة المستخدم إلى قائمة المشاركين
    await db.collection("rooms").updateOne(
      { _id: new ObjectId(roomId) },
      {
        $push: {
          participants: { userId: new ObjectId(userId), joinedAt: new Date() },
        },
      }
    );

    res.json({ message: "Successfully joined the room" });
  } catch (err) {
    res.status(500).json({ error: "Failed to join room" });
  }
});

router.post("/request-access/:roomId", authMiddleware, async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;

  try {
    const room = await db
      .collection("rooms")
      .findOne({ _id: new ObjectId(roomId) });
    if (!room) return res.status(404).json({ error: "Room not found" });

    if (room.ownerId.toString() === userId) {
      return res.status(400).json({ error: "You are the owner of the room" });
    }

    if (room.password) {
      // التحقق من كلمة مرور الغرفة
      const { password } = req.body;
      if (room.password !== password) {
        return res.status(400).json({ error: "Incorrect password" });
      }
    }

    // إرسال طلب للوصول إلى الغرفة
    await db.collection("room_requests").insertOne({
      roomId: new ObjectId(roomId),
      userId: new ObjectId(userId),
      status: "pending",
      createdAt: new Date(),
    });

    res.json({ message: "Request sent to room owner" });
  } catch (err) {
    res.status(500).json({ error: "Failed to request access" });
  }
});

// مسار للموافقة على طلب الوصول
router.post("/approve-access/:requestId", authMiddleware, async (req, res) => {
  const db = getDB();
  const { requestId } = req.params;

  try {
    const request = await db.collection("room_requests").findOne({
      _id: new ObjectId(requestId),
    });

    if (!request) return res.status(404).json({ error: "Request not found" });

    const room = await findRoomById(db, request.roomId);
    if (room.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ error: "You are not the room owner" });
    }

    // الموافقة على طلب الوصول
    await db
      .collection("room_requests")
      .updateOne(
        { _id: new ObjectId(requestId) },
        { $set: { status: "approved" } }
      );

    await db.collection("rooms").updateOne(
      { _id: new ObjectId(request.roomId) },
      {
        $push: {
          participants: { userId: request.userId, joinedAt: new Date() },
        },
      }
    );

    res.json({ message: "Access approved" });
  } catch (err) {
    res.status(500).json({ error: "Failed to approve access" });
  }
});

// مسار للخروج من الغرفة
router.post("/leave-room/:roomId", authMiddleware, async (req, res) => {
  const db = getDB();
  const { roomId } = req.params;
  const userId = req.user.id;

  try {
    const room = await findRoomById(db, roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });

    // إزالة المستخدم من المشاركين
    await db
      .collection("rooms")
      .updateOne(
        { _id: new ObjectId(roomId) },
        { $pull: { participants: { userId: new ObjectId(userId) } } }
      );

    res.json({ message: "Successfully left the room" });
  } catch (err) {
    res.status(500).json({ error: "Failed to leave room" });
  }
});

// مسار لعرض المشاركين في الغرفة
router.get("/participants/:roomId", authMiddleware, async (req, res) => {
  const db = getDB();
  const { roomId } = req.params;

  try {
    const room = await findRoomById(db, roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });

    res.json(room.participants);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch participants" });
  }
});

module.exports = router;
