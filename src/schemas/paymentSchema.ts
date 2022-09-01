import Joi from "joi";

const payment = Joi.object({
	idCard: Joi.number().required(),
	password: Joi.string().min(4).max(4).required(),
	value: Joi.number().greater(0).required(),
});

export default payment;
