import Joi from "joi";

const value = Joi.object({
	value: Joi.number().greater(0).required(),
});

export default value;
