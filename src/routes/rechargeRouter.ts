import { Router } from "express";
import { verifyApiKey } from "../middlewares/verifyApiKey.js";
import { validateSchema } from "../middlewares/schemasValidator.js";
import value from "../schemas/valueSchema.js";
import { rechargeCard } from "../controllers/rechargeController.js";

const rechargeRouter = Router();

rechargeRouter.post(
	"/recharge/:id",
	verifyApiKey,
	validateSchema(value),
	rechargeCard
);

export default rechargeRouter;
