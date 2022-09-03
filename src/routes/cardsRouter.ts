import { Router } from "express";
import { verifyApiKey } from "../middlewares/verifyApiKey.js";
import { validateSchema } from "../middlewares/schemasValidator.js";
import typeCards from "../schemas/typeCardsSchema.js";
import {
	newCard,
	activateCard,
	sendCards,
	sendBalance,
	blockCard,
	unlockCard,
	newVirtualCard,
	deleteVirtualCard,
} from "../controllers/cardsControlles.js";

const cardsRouter = Router();

cardsRouter.post("/cards", verifyApiKey, validateSchema(typeCards), newCard);
cardsRouter.put("/activate", activateCard);
cardsRouter.get("/cards/all/:id", sendCards);
cardsRouter.get("/cards/:id", sendBalance);
cardsRouter.put("/cards/block", blockCard);
cardsRouter.put("/cards/unlock", unlockCard);
cardsRouter.post("/virtualcards", newVirtualCard);
cardsRouter.delete("/virtualcards/:id", deleteVirtualCard);

export default cardsRouter;
