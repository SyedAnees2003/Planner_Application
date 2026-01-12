const bcrypt = require("bcrypt");
const { User } = require("../models");
const generateToken = require("../utils/tokens");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  const token = generateToken(user.id);

  res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email },
    token
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "User not found, try registering" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken(user.id);

  res.json({
    user: { id: user.id, name: user.name, email: user.email },
    token
  });
};

module.exports = { register, login };
