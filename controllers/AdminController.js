
const Admin = require("../models/Admin");

const getAdmin = async (req, res) => {
  const admin = await Admin.find().lean()
  if (!admin) {
    res.status(500).json({ error: error.message });
  }
  return res.status(200).json(admin);
}
//getAdminById?????
const updateAdmin = async (req, res) => {
  const { _id } = req.params
  const { password, username, email } = req.body
  const admin = await Admin.findById({ _id: req.user._id })
  if (!admin) {
    return res.status(401).json({ message: "not found" })
  }
  console.log(req.user._id);
  if (admin._id == req.user._id ) {
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

module.exports = { getAdmin, updateAdmin }

