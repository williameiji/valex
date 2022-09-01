import { Router } from "express";
import { validateSchema } from "../middlewares/schemasValidator.js";
import onlinePayment from "../schemas/onlinePaymentSchema.js";
import payment from "../schemas/paymentSchema.js";
import {
	cardPayments,
	cardOnlinePayments,
} from "../controllers/paymentsController.js";

const paymentsRouter = Router();

paymentsRouter.post("/payments/:id", validateSchema(payment), cardPayments);
paymentsRouter.post(
	"/payments/online/:id",
	validateSchema(onlinePayment),
	cardOnlinePayments
);

export default paymentsRouter;
