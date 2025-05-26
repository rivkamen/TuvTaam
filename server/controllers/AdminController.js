
const Admin = require("../models/Admin");

const getAdminInfo = async (req, res) => {
  const adminInfo = {
    username: process.env.ADMINUSERNAME,
    email: process.env.ADMINEMAIL,
    password: process.env.ADMIN,
    role: 'admin'
  }
  if (!adminInfo) {
    res.status(500).json({ error: error.message });
  }
  return res.status(200).json(adminInfo);
}

const getAdmin = async (req, res) => {
  // const admin = await Admin.find().lean()
  // if (!admin) {
  //   res.status(500).json({ error: error.message });
  // }
  // return res.status(200).json(admin);
}

const getAdminByMailAndPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

const getAdminById = async (req, res) => {
  try {
    const { _id } = req.params;
    const admin = await Admin.findById({ _id: req.user._id });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


const updateAdmin = async (req, res) => {
  const { _id } = req.params
  const { password, username, email } = req.body
  const admin = await Admin.findById({ _id: req.user._id })
  if (!admin) {
    return res.status(401).json({ message: "not found" })
  }
  console.log(req.user._id);
  if (admin._id == req.user._id) {
    if (username) {
      admin.username = username;
    }
    if (email) {
      admin.email = email;
    }
    const updateAdmin = await admin.save()
    return res.status(201).json({
      success: true,
      message: `admin ${admin.username}updated successfuly`,
    })
  }
  return res.status(405).json({ message: "unaouthorised" })
}

module.exports = { getAdminInfo, getAdmin, updateAdmin, getAdminById, getAdminByMailAndPassword }