const express = require("express");
const { createUser, findUserByEmail } = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDB } = require("../config/db");

const router = express.Router();

router.post("/register", async (req, res) => {
  const db = getDB();
  const { username, email, password } = req.body;

  try {
    const user = await createUser(db, { username, email, password });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to register user" });
  }
});

router.post("/login", async (req, res) => {
  const db = getDB();
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(db, email);
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Failed to login" });
  }
});

module.exports = router;
