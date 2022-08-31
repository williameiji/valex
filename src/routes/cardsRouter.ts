import { Router } from "express";
import { verifyApiKey } from "../middlewares/verifyApiKey.js";
import { validateSchema } from "../middlewares/schemasValidator.js";
import typeCards from "../schemas/typeCardsSchema.js";
import { newCard, activateCard } from "../controllers/cardsControlles.js";

const cardsRouter = Router();

cardsRouter.post("/cards", verifyApiKey, validateSchema(typeCards), newCard);
cardsRouter.put("/activate", activateCard);

export default cardsRouter;
