const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('../validation');

//Register
router.post('/register', async (req, res) => {
	//Input validation
	console.log('register');
	const { error, value } = registerValidation(req.body);

	if (error) return res.status(400).json('error ' + error.details[0].message);

	//Existing user validation
	const emailExist = await User.findOne({ where: { email: req.body.email } });

	if (emailExist)
		return res.status(400).json('That email is already registered');

	//Hashing the password
	const salt = await bcrypt.genSalt(10);
	var hashedPassword = await bcrypt.hash(req.body.password, salt);

	//Create a new user
	const user = User.build({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		password: hashedPassword,
		role: 'user',
		expo_push_token: req.body.expo_push_token,
	});
	try {
		const savedUser = await user.save();
		res.send({ user: savedUser.id });
	} catch (err) {
		if (err?.name === 'SequelizeValidationError') {
			res.status(400).send({ msg: err.errors[0].message });
		} else {
			res.status(400).send({ msg: err });
		}
	}
});

//Login
router.post('/login', async (req, res) => {
	//Input validation
	const { error, value } = loginValidation(req.body);

	if (error) return res.status(400).json({ msg: error.details[0].message });

	//Existing user validation
	const user = await User.findOne({ where: { email: req.body.email } });

	if (!user) return res.status(401).json('Email or password is wrong');

	//Password validation
	const validPass = await bcrypt.compare(req.body.password, user.password);

	if (!validPass) return res.status(401).json('Email or password is wrong');

	//Create and assign token
	const token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET);
	res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
	res.cookie('userId', user.id, { httpOnly: true, sameSite: 'lax' });
	res.json({ token: token, role: user.role, userId: user.id });
});

router.post('/logout', async (req, res) => {
	res.clearCookie('token').send();
});

module.exports = router;
