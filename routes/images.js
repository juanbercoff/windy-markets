const router = require('express').Router();
const Image = require('../models/Image');
const multer = require('multer');
const { upload } = require('../config/storage');
const sharp = require('sharp');
const destination = '../windy-market-web/src/public/images/trade-images/';

router.post('/:tradeId', upload.single('image'), async (req, res) => {
	const uniqueImageName =
		Date.now() + '-' + Math.round(Math.random() * 1e9) + '.jpeg';
	const inputImage = sharp(req.file.buffer);
	inputImage.metadata().then((metadata) => {
		return inputImage
			.extract({
				left: 0,
				top: 30,
				width: metadata.width,
				height: 725,
			})
			.toFile(destination + uniqueImageName)
			.catch((err) => {
				return res.status(400).send({ msg: err });
			});
	});

	const image = Image.build({
		imageURL: uniqueImageName,
		tradeId: req.params.tradeId,
	});

	try {
		await image.save();
		res.send({ image: image.id });
	} catch (err) {
		console.log(err);
		res.status(400).send({ msg: err });
	}

	res.send(results);
});

router.get('/tradeImages/:tradeId', async (req, res) => {
	const results = await Image.findAll({
		where: {
			tradeId: req.params.tradeId,
		},
	});

	res.send(results);
});

module.exports = router;
