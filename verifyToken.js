const jwt = require('jsonwebtoken');
const User = require('./models/User');

const verifyToken = (req, res, next) => {
	const token = req.cookies.token;
	if (!token) return res.status(401).send('Access Denied');

	try {
		const verified = jwt.verify(token, process.env.TOKEN_SECRET);
		req.user = verified;
		next();
	} catch (err) {
		res.status(400).send('Invalid Token');
	}
};

const verifyIsSameUser = (req, res, next) => {
	if (req.user.id === req.params.userId) {
		next();
	} else {
		return res.status(401).send('Access Denied');
	}
};

const verifyAdmin = async (req, res, next) => {
	try {
		const admin = await User.findOne({
			where: {
				id: req.user.id,
			},
		});
		if (admin.role === 'admin') {
			next();
		} else {
			throw 'Access denied';
		}
	} catch (e) {
		res.status(401).send(e);
	}
};

module.exports = { verifyToken, verifyAdmin, verifyIsSameUser };
