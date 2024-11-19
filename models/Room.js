const { ObjectId } = require("mongodb");

async function createRoom(db, { name, ownerId }) {
  const result = await db.collection("rooms").insertOne({
    name,
    // ownerId: new ObjectId(ownerId),
    participants: [new ObjectId(ownerId), new ObjectId(userId)],
    createdAt: new Date(),
  });
  return result.ops[0];
}

async function findRoomById(db, roomId) {
  return await db.collection("rooms").findOne({ _id: new ObjectId(roomId) });
}

async function addParticipant(db, roomId, userId) {
  return await db
    .collection("rooms")
    .updateOne(
      { _id: new ObjectId(roomId) },
      { $addToSet: { participants: new ObjectId(userId) } }
    );
}

module.exports = { createRoom, findRoomById, addParticipant };
