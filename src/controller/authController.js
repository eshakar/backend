import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const createToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: "All fields required" });

    if (!["user", "admin"].includes(role)) return res.status(400).json({ message: "Invalid role" });

    if (await User.findOne({ email })) return res.status(400).json({ message: "Email taken" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, role });
    res.status(201).json({ message: "Registered", token: createToken(user) });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing credentials" });

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Invalid credentials" });

    res.json({ message: "Logged in", token: createToken(user) });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login error" });
  }
};
