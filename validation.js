const { any } = require('joi');
const Joi = require('joi');

//Register Validation
const registerValidation = (data) => {
	const schema = Joi.object({
		firstName: Joi.string().min(2).required(),
		lastName: Joi.string().min(2).required(),
		email: Joi.string().min(3).required().email(),
		password: Joi.string().min(6).required(),
	});

	return schema.validate(data);
};

const loginValidation = (data) => {
	const schema = Joi.object({
		email: Joi.string().min(3).required().email(),
		password: Joi.string().min(6).required(),
	});

	return schema.validate(data);
};

const tradeValidation = (data) => {
	const schema = Joi.object({
		stock: Joi.string().max(10).required(),
		contractType: Joi.string().required().valid('Call', 'Put'),
		strike: Joi.number().required(),
		expirationDate: Joi.date().required(),
		price: Joi.any(),
	});

	return schema.validate(data);
};

const userTradeValidation = (data) => {
	const schema = Joi.object({
		price: Joi.number().required(),
		amount: Joi.number().required(),
	});

	return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.tradeValidation = tradeValidation;
module.exports.userTradeValidation = userTradeValidation;
