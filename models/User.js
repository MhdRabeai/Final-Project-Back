const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");

async function createUser(db, { username, email, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await db.collection("usersss").insertOne({
    username,
    email,
    password: hashedPassword,
  });
  return result.ops[0];
}

async function findUserByEmail(db, email) {
  return await db.collection("usersss").findOne({ email });
}

async function findUserById(db, id) {
  return await db.collection("usersss").findOne({ _id: new ObjectId(id) });
}

module.exports = { createUser, findUserByEmail, findUserById };
