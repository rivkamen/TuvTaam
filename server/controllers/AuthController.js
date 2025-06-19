const { User } = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const login = async (req, res) => {
	const { email, password } = req.body
	console.log('login')

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
	const user = await User.findOne({ email }).lean()
	if (!user) {
		return res.status(401).json({ message: 'unauthorized' })
	}
	const match = await bcrypt.compare(password, user.password)

	if (!match) {
		return res.status(401).json({ message: 'unauthorized' })
	}
	if (user.role == 'admin') {
		const adminInfo = {
			username: user.username,
			email: user.email,
			role: 'admin'
		}
		const token = jwt.sign(adminInfo, process.env.ACCESS_TOKEN_SECRET)
		return res.json({ token, role: 'admin' })
	}
	if (user.role == 'user') {
		const userInfo = {
			_id: user._id,
			username: user.username,
			email: user.email,
			role: 'user',
			dueDate: user.dueDate,
			parashah: user.parashah,
			haftarah: user.haftarah
		}
		const token = jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET)
		return res.json({ token, role: 'user', user: userInfo })
	}
}
async function register(req, res) {
	try {
		const { username, password, email, dueDate, parashah, haftarah } = req.body
		if (!email || !password || !dueDate || !parashah) {
			return res.status(400).json({ message: 'חסרים שדות נדרשים' })
		}
		if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return res.status(400).json({ message: 'Invalid email format' })
		}
		const existingUser = await User.findOne({ email: { $eq: email } })
		if (existingUser) {
			return res.status(400).json({ message: 'משתמש עם מייל זה כבר קיים' })
		}
		const hashedPassword = await bcrypt.hash(password, 10)
		const newUser = new User({
			role: 'user',
			username: username ?? email.split('@')[0],
			password: hashedPassword,
			email,
			dueDate,
			parashah,
			haftarah
		})

		await newUser.save()
		const userInfo = {
			_id: newUser._id,
			username: newUser.username,
			email: newUser.email,
			password: newUser.password,
			role: 'user',
			dueDate,
			parashah,
			haftarah
		}
		const token = jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET)

		res
			.status(201)
			.json({ message: `The user ${newUser.username} added successfuly`, token: token, role: 'user', user: userInfo })
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: 'opsss... server error:(' })
	}
}

const loginWithGoogle = async (req, res) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: 'Not authenticated with Google' })
		}

		const googleUser = req.user
		const payload = {
			username: googleUser.displayName,
			email: googleUser.emails[0].value,
			role: 'user'
		}

		const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET)

		// במקרה של אפליקציית Angular – נוח להחזיר עם redirect + token
		res.redirect(`http://localhost:4200/dashboard?token=${token}`)

		// לחלופין, אם רוצים להחזיר JSON:
		// const userInfo = {
		// 	_id: user._id,
		// 	username: user.username,
		// 	email: user.email,
		// 	role: user.role,
		// 	parashah: user.parashah,
		// 	haftarah: user.haftarah,
		// 	dueDate: user.dueDate
		// }
		// console.log(userInfo)

		// const token = jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET)
		// return res.json({ token, user: userInfo })
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: 'Google login failed' })
	}
}

module.exports = { login, register, loginWithGoogle }
