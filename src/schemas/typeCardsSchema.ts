import Joi from "joi";

const typeCards = Joi.object({
	type: Joi.any().valid(
		"groceries",
		"restaurants",
		"transport",
		"education",
		"health"
	),
	id: Joi.number(),
});

export default typeCards;
