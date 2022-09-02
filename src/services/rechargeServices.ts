import * as rechargeRepository from "../repositories/rechargeRepository.js";
import * as cardsServices from "./cardsServices.js";

export async function rechargeCard(id: number, value: number, apiKey: string) {
	await cardsServices.isApiKeyValid(apiKey);

	const card = await cardsServices.getCardInformation(id);

	cardsServices.isCardRegistered(card);

	if (card.isVirtual)
		throw {
			code: "BadRequest",
			message: "Cartões virtuais não podem ser recarregados!",
		};

	cardsServices.isCardInactive(card.password);

	cardsServices.isCardExpired(card.expirationDate);

	await rechargeRepository.insert({ cardId: id, amount: value });
}
