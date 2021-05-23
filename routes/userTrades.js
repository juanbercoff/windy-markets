const router = require('express').Router();
const UserTrade = require('../models/UserTrade');
const Trade = require('../models/Trade');
const { userTradeValidation } = require('../validation');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { startOfWeek, endOfWeek } = require('date-fns');
const { verifyIsSameUser } = require('../verifyToken');

const storage = multer.diskStorage({
	destination: '../user-images-storage/',
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(
			null,
			file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
		);
	},
});

const upload = multer({
	storage: storage,
	limits: { fileSize: 1000000 },
}).single('image');

router.post('/:tradeId/:userId', (req, res) => {
	upload(req, res, async (err) => {
		if (err instanceof multer.MulterError) {
			return res.status(400).send({ msg: err.message });
		}

		//Input validation
		const { error, value } = userTradeValidation(req.body);

		if (error) return res.status(400).send({ msg: error.details[0].message });
		// Trade is already being followed
		const tradeIsBeingFollowed = await UserTrade.findOne({
			where: { tradeId: req.params.tradeId, userId: req.params.userId },
		});

		if (tradeIsBeingFollowed)
			return res
				.status(400)
				.json({ msg: 'You are already following that trade' });

		const userTrade = UserTrade.build({
			price: req.body.price,
			amount: req.body.amount,
			imageURL: req.file?.filename,
			userId: req.params.userId,
			status: 'open',
			tradeId: req.params.tradeId,
		});
		try {
			await userTrade.save();
			res.send({ userTrade: userTrade.id });
		} catch (err) {
			console.log(err);
			res.status(400).send({ msg: err });
		}
	});
});

router.get('/all/:userId', async (req, res) => {
	console.log('userId: ' + req.user.id);
	console.log('userId2: ' + req.params.userId);

	if (req.user.id != req.params.userId)
		return res.status(401).send({ msg: 'Access denied' });
	const today = new Date();
	const start = startOfWeek(today, { weekStartsOn: 1 });
	const end = endOfWeek(today, { weekStartsOn: 1 });

	try {
		const results = await UserTrade.findAll({
			where: {
				userId: req.params.userId,
				createdAt: {
					[Op.between]: [start, end],
				},
			},

			include: Trade,
		});
		res.send(results);
	} catch (err) {
		console.log(err);
	}
});

function deleteImage(imageURL) {
	try {
		return fs.unlinkSync(
			path.resolve(__dirname, '../../user-images-storage/' + imageURL)
		);
	} catch (err) {
		return console.log(err);
	}
}

router.put('/close/:userTradeId', async (req, res) => {
	const updatedUserTrade = await UserTrade.update(
		{
			status: 'sold',
			closePrice: req.body.closePrice,
		},
		{
			where: {
				id: req.params.userTradeId,
			},
		}
	);
	res.send({ msg: updatedUserTrade[0] });
});

module.exports = router;
