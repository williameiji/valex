import * as cardRepository from "../repositories/cardRepository.js";
import * as rechargeRepository from "../repositories/rechargeRepository.js";
import * as paymentRepository from "../repositories/paymentRepository.js";
import * as businessRepository from "../repositories/businessRepository.js";
import { checkExpirationDate } from "./cardsServices.js";
import { sendBalance, decodePassword, decodeCvc } from "./cardsServices.js";
import Cryptr from "cryptr";
import dotenv from "dotenv";

dotenv.config();

export async function cardPayments(
	idBusiness: number,
	idCard: number,
	passwordCard: string,
	value: number
) {
	const card = await cardRepository.findById(idCard);

	if (!card) throw { code: "NotFound", message: "Cartão não encontrado." };

	if (card.isVirtual)
		throw {
			code: "Anauthorized",
			message: "Cartões virtuais não podem ser usados nesse pagamento!",
		};

	if (!card.password) throw { code: "BadRequest", message: "Cartão inativo!" };

	await decodePassword(card.password, passwordCard);

	if (checkExpirationDate(card.expirationDate))
		throw { code: "BadRequest", message: "Cartão expirado." };

	if (card.isBlocked)
		throw { code: "BadRequest", message: "Cartão bloqueado." };

	const establishment = await businessRepository.findById(idBusiness);

	if (!establishment)
		throw { code: "NotFound", message: "Estabelecimento não encontrado." };

	if (card.type !== establishment.type)
		throw {
			code: "Anauthorized",
			message: "O tipo de estabelecimento não é o mesmo do tipo do cartão!",
		};

	const { balance } = await sendBalance(idCard);

	if (balance < value) {
		throw { code: "BadRequest", message: "Saldo insuficiente!" };
	} else {
		await paymentRepository.insert({
			cardId: idCard,
			businessId: idBusiness,
			amount: value,
		});
	}
}

export async function cardOnlinePayments(
	idBusiness: number,
	cardNumber: string,
	cvc: string,
	name: string,
	expeditionDate: string,
	value: number
) {
	const card = await cardRepository.findByCardDetails(
		cardNumber,
		name,
		expeditionDate
	);

	if (!card) throw { code: "NotFound", message: "Cartão não encontrado." };

	if (!card.password) throw { code: "BadRequest", message: "Cartão inativo!" };

	await decodeCvc(card.securityCode, cvc);

	if (checkExpirationDate(card.expirationDate))
		throw { code: "BadRequest", message: "Cartão expirado." };

	if (card.isBlocked)
		throw { code: "BadRequest", message: "Cartão bloqueado." };

	const establishment = await businessRepository.findById(idBusiness);

	if (!establishment)
		throw { code: "NotFound", message: "Estabelecimento não encontrado." };

	if (card.type !== establishment.type)
		throw {
			code: "Anauthorized",
			message: "O tipo de estabelecimento não é o mesmo do tipo do cartão!",
		};

	let totalBalance: number;

	if (card.isVirtual) {
		const { balance } = await sendBalance(card.originalCardId);
		totalBalance = balance;
	} else {
		const { balance } = await sendBalance(card.id);
		totalBalance = balance;
	}

	if (totalBalance < value) {
		throw { code: "BadRequest", message: "Saldo insuficiente!" };
	} else if (card.isVirtual) {
		await paymentRepository.insert({
			cardId: card.originalCardId,
			businessId: idBusiness,
			amount: value,
		});
	} else {
		await paymentRepository.insert({
			cardId: card.id,
			businessId: idBusiness,
			amount: value,
		});
	}
}
