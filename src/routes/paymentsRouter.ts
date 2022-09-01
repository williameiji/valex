import { Router } from "express";
import { validateSchema } from "../middlewares/schemasValidator.js";
import payment from "../schemas/paymentSchema.js";
import { cardPayments } from "../controllers/paymentsController.js";

const paymentsRouter = Router();

paymentsRouter.post("/payments/:id", validateSchema(payment), cardPayments);

export default paymentsRouter;
