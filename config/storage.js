const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const userStorage = multer.diskStorage({
	destination: '../windy-market-web/src/public/images/user-trade-images/',
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
});

const userUpload = multer({
	storage: userStorage,
	limits: { fileSize: 1000000 },
}).single('image');

module.exports.upload = upload;
module.exports.userUpload = userUpload;
