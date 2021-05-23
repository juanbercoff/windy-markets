const router = require('express').Router();
const Trade = require('../models/Trade');
const Image = require('../models/Image');
const User = require('../models/User');
const { tradeValidation } = require('../validation');
const { Op } = require('sequelize');
const multer = require('multer');
const { upload } = require('../config/storage');
const fs = require('fs');
const { startOfWeek, endOfWeek } = require('date-fns');
const { verifyToken, verifyAdmin } = require('../verifyToken');
const { sendNotifications } = require('../pushNotifications');

const destination = '../windy-market-web/src/public/images/trade-images/';

router.post(
	'/',
	upload.single('image'),
	verifyToken,
	verifyAdmin,
	async (req, res) => {
		const uniqueImageName =
			Date.now() + '-' + Math.round(Math.random() * 1e9) + '.jpeg';
		/* const image = sharp(req.file.buffer);
	image.metadata().then((metadata) => {
		return image
			.extract({
				left: 0,
				top: 145,
				width: metadata.width,
				height: 465,
			})
			.toFile(destination + uniqueImageName);
	}); */

		//Input validation
		const { error, value } = tradeValidation(req.body);

		if (error) return res.status(400).send({ msg: error.details[0].message });

		const trade = Trade.build({
			stock: req.body.stock,
			contractType: req.body.contractType,
			strike: req.body.strike,
			price: req.body.price,
			expirationDate: req.body.expirationDate,
			status: 'placed',
		});
		try {
			const results = await User.findAll();
			const push_tokens = results.map((e) => e.dataValues.expo_push_token);
			console.log('tokens:   ' + push_tokens);
			await trade.save();

			const image = Image.build({
				imageURL: uniqueImageName,
				tradeId: trade.id,
			});
			await image.save();
			sendNotifications(push_tokens, 'NEW TRADE', 'TEST');
			res.send({ trade: trade.id, image: image.id });
		} catch (err) {
			res.status(400).send({ msg: err });
		}
	}
);

router.get('/all', async (req, res) => {
	const results = await Trade.findAll();

	res.send(results);
});

router.get('/past', async (req, res) => {
	const today = new Date();
	const start = startOfWeek(today, { weekStartsOn: 1 });
	const end = endOfWeek(today, { weekStartsOn: 1 });

	const results = await Trade.findAll({
		where: {
			createdAt: {
				[Op.notBetween]: [start, end],
			},
		},
	});
	res.send(results);
});

router.get('/current', async (req, res) => {
	const today = new Date();
	const start = startOfWeek(today, { weekStartsOn: 1 });
	const end = endOfWeek(today, { weekStartsOn: 1 });

	/* const results = await Trade.findAll({
        where: sequelize.where(sequelize.literal('CURRENT_DATE'),sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')))
    }) */

	const results = await Trade.findAll({
		where: {
			createdAt: {
				[Op.between]: [start, end],
			},
		},
		order: [['updatedAt', 'DESC']],
	});
	res.send(results);
});

function deleteImage(imageURL) {
	try {
		return fs.unlinkSync(
			path.resolve(__dirname, '../../images-storage/' + imageURL)
		);
	} catch (err) {
		return console.log(err);
	}
}

router.put('/:tradeId', verifyToken, verifyAdmin, async (req, res) => {
	//Input validation
	const { error, value } = tradeValidation(req.body);
	if (error) return res.status(400).send({ msg: error.details[0].message });

	const updatedTrade = await Trade.update(
		{
			stock: req.body.stock,
			contractType: req.body.contractType,
			price: req.body.price,
			strike: req.body.strike,
			expirationDate: req.body.expirationDate,
		},
		{
			where: {
				id: req.params.tradeId,
			},
		}
	);
	res.send({ msg: updatedTrade[0] + ' rows modified' });
});

router.put('/confirm/:tradeId', verifyToken, verifyAdmin, async (req, res) => {
	const updatedTrade = await Trade.update(
		{
			status: 'filled',
			price: req.body.price,
		},
		{
			where: {
				id: req.params.tradeId,
			},
			returning: true,
		}
	);
	res.send({ msg: updatedTrade[0] });
});

router.put('/close/:tradeId', verifyToken, verifyAdmin, async (req, res) => {
	const updatedTrade = await Trade.update(
		{
			status: 'sold',
			closePrice: req.body.closePrice,
		},
		{
			where: {
				id: req.params.tradeId,
			},
			returning: true,
		}
	);

	res.send({ msg: updatedTrade[0] });
});

router.put('/roll/:tradeId', verifyToken, verifyAdmin, async (req, res) => {
	const updatedTrade = await Trade.update(
		{
			status: 'rolled',
			closePrice: req.body.closePrice,
		},
		{
			where: {
				id: req.params.tradeId,
			},
		}
	);
	res.send({ msg: updatedTrade[0] });
});

router.delete('/', verifyToken, verifyAdmin, async (req, res) => {
	const deletedTrade = await Trade.destroy({
		where: {
			id: req.body.id,
		},
	});
	res.send({ msg: deletedTrade[0] }) + ' was deleted';
});

module.exports = router;
