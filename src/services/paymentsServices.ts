import * as cardRepository from "../repositories/cardRepository.js";
import * as paymentRepository from "../repositories/paymentRepository.js";
import * as businessRepository from "../repositories/businessRepository.js";
import * as cardsServices from "./cardsServices.js";
import dotenv from "dotenv";

dotenv.config();

export async function cardPayments(
	idBusiness: number,
	idCard: number,
	passwordCard: string,
	value: number
) {
	const card = await cardsServices.getCardInformation(idCard);

	cardsServices.isCardRegistered(card);

	cardsServices.checkCardType(card.isVirtual);

	cardsServices.isCardInactive(card.password);

	await cardsServices.checkDecodePassword(card.password, passwordCard);

	cardsServices.isCardExpired(card.expirationDate);

	cardsServices.isCardBlocked(card.isBlocked);

	await checkStablishmentInformation(idBusiness, card.type);

	const { balance } = await cardsServices.sendBalance(idCard);

	await populatePayments(balance, value, idCard, idBusiness, false);
}

export async function cardOnlinePayments(
	idBusiness: number,
	cardNumber: string,
	cvc: string,
	name: string,
	expeditionDate: string,
	value: number
) {
	const card = await getCardInformationByDetails(
		cardNumber,
		name,
		expeditionDate
	);

	cardsServices.isCardRegistered(card);

	cardsServices.isCardInactive(card.password);

	await cardsServices.checkDecodeCvc(card.securityCode, cvc);

	cardsServices.isCardExpired(card.expirationDate);

	cardsServices.isCardBlocked(card.isBlocked);

	await checkStablishmentInformation(idBusiness, card.type);

	const totalBalance = await calculateTotalBalance(
		card.isVirtual,
		card.originalCardId,
		card.id
	);

	await populatePayments(
		totalBalance,
		value,
		card.id,
		idBusiness,
		card.isVirtual,
		card.originalCardId
	);
}

//api

async function getCardInformationByDetails(
	cardNumber: string,
	name: string,
	expeditionDate: string
) {
	return await cardRepository.findByCardDetails(
		cardNumber,
		name,
		expeditionDate
	);
}

async function populatePayments(
	balance: number,
	value: number,
	idCard: number,
	idBusiness: number,
	isVirtual: boolean,
	originalCardId?: number
) {
	if (balance < value) {
		throw { code: "BadRequest", message: "Saldo insuficiente!" };
	} else if (isVirtual) {
		await paymentRepository.insert({
			cardId: originalCardId,
			businessId: idBusiness,
			amount: value,
		});
	} else {
		await paymentRepository.insert({
			cardId: idCard,
			businessId: idBusiness,
			amount: value,
		});
	}
}

async function checkStablishmentInformation(
	id: number,
	type: cardRepository.TransactionTypes
) {
	const establishment = await businessRepository.findById(id);

	if (!establishment)
		throw { code: "NotFound", message: "Estabelecimento não encontrado." };

	if (type !== establishment.type)
		throw {
			code: "Anauthorized",
			message: "O tipo de estabelecimento não é o mesmo do tipo do cartão!",
		};
}

//api

async function calculateTotalBalance(
	isVirtual: boolean,
	originalCardId: number,
	cardId: number
) {
	let totalBalance: number;

	if (isVirtual) {
		const { balance } = await cardsServices.sendBalance(originalCardId);
		return (totalBalance = balance);
	} else {
		const { balance } = await cardsServices.sendBalance(cardId);
		return (totalBalance = balance);
	}
}
