import * as rechargeRepository from "../repositories/rechargeRepository.js";
import * as cardsServices from "./cardsServices.js";

export async function rechargeCard(id: number, value: number, apiKey: string) {
	await cardsServices.isApiKeyValid(apiKey);

	const card = await cardsServices.getCardInformation(id);

	cardsServices.isCardRegistered(card);

	cardsServices.checkCardType(card.isVirtual);

	cardsServices.isCardInactive(card.password);

	cardsServices.isCardExpired(card.expirationDate);

	await populateRecharge(id, value);
}

async function populateRecharge(id: number, value: number) {
	rechargeRepository.insert({ cardId: id, amount: value });
}
