
const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).lean();
  if (!user) {
    return res.status(401).json({ message: "unauthorized" });
  } const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: "unauthorized" });
  }

  if (user.role == 'admin') {
    const adminInfo = {
      username: user.username,
      email: user.email,
      role: 'admin'
    };
    const token = jwt.sign(adminInfo, process.env.ACCESS_TOKEN_SECRET);
    return res.json({ token, role: 'admin' });
  }
  if (user.role == 'user') {
    const userInfo = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: 'user'
    };
    const token = jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET);
    return res.json({ token, role: 'user' });
  }

};


async function register(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'חסרים פרטים נדרשים' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'משתמש עם מייל זה כבר קיים' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: 'user'
    });

    await newUser.save();
    const userInfo = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      password: newUser.password,
      role: 'user'
    };
    const token = jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET);

    res.status(201).json({ message: `The user ${newUser.username} added successfuly`, token: token, role: 'user' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'opsss... server error:(' });
  }
}

module.exports = { login, register }