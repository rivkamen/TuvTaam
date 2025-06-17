const { User } = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("login");

	if (!email || !password) {
		return res.status(400).json({ message: 'required field is missing' })
	}
	console.log('login')

	const adminEmail = process.env.ADMINEMAIL
	const adminPassword = process.env.ADMIN
	const adminUsername = process.env.ADMINUSERNAME

	if (email === adminEmail && password === adminPassword) {
		const adminInfo = {
			username: adminUsername,
			email: adminEmail,
			role: 'admin'
		}
		console.log('login')

		const token = jwt.sign(adminInfo, process.env.ACCESS_TOKEN_SECRET)
		return res.json({ token, role: 'admin', usernane: adminUsername })
	}

  // בדיקת משתמש רגיל ממסד הנתונים
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

const loginWithGoogle = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated with Google" });
    }

    const googleUser = req.user;
    const payload = {
      username: googleUser.displayName,
      email: googleUser.emails[0].value,
      role: "user"     };

    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);

    // במקרה של אפליקציית Angular – נוח להחזיר עם redirect + token
    res.redirect(`http://localhost:4200/dashboard?token=${token}`);

    // לחלופין, אם רוצים להחזיר JSON:
    // res.json({ token, role: "user" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Google login failed" });
  }

	const userInfo = {
		_id: user._id,
		username: user.username,
		email: user.email,
		role: user.role,
		parashah: user.parashah,
		haftarah: user.haftarah,
		dueDate: user.dueDate
	}
	console.log(userInfo)

	const token = jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET)
	return res.json({ token, user: userInfo })
}

const register = async (req, res) => {
	console.log('register')
	const { username, password, email, dueDate, parashah, haftarah } = req.body
	if (!email || !password || !dueDate || !parashah) {
		return res.status(400).json({ message: 'required field is missing' })
	}
	const duplicate = await User.findOne({ email }).lean()
	if (duplicate) return res.status(409).json({ message: 'duplicate email' })
	const hashedPwd = await bcrypt.hash(password, 10)
	const userObject = {
		username: username ?? email.split('@')[0],
		password: hashedPwd,
		email,
		dueDate,
		parashah,
		haftarah
	}
	const user = await User.create(userObject)
	if (user) {
		return res.status(201).json({ success: true, message: `user ${user.username} created successfuly` })
	} else return res.status(400).json({ message: 'failed' })
}
module.exports = { login, register }
