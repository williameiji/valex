import Joi from "joi";

const onlinePayment = Joi.object({
	cardNumber: Joi.string().required(),
	cvc: Joi.string().required(),
	name: Joi.string().required(),
	expeditionDate: Joi.string().required(),
	value: Joi.number().greater(0).required(),
});

export default onlinePayment;
