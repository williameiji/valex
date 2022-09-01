import Joi from "joi";

const typeCards = Joi.object({
	type: Joi.any()
		.valid("grocerie", "restaurant", "transport", "education", "health")
		.required(),
	id: Joi.number().required(),
});

export default typeCards;
