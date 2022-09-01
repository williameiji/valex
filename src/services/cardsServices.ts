import { faker } from "@faker-js/faker";
import { findByApiKey } from "../repositories/companyRepository.js";
import { findById } from "../repositories/employeeRepository.js";
import * as cardRepository from "../repositories/cardRepository.js";
import * as rechargeRepository from "../repositories/rechargeRepository.js";
import * as paymentRepository from "../repositories/paymentRepository.js";
import Cryptr from "cryptr";
import dotenv from "dotenv";

dotenv.config();

export async function newCard(
	apiKey: string,
	type: cardRepository.TransactionTypes,
	employeeId: number
) {
	const cryptr = new Cryptr(process.env.SECRET);
	const isKeyValid = await findByApiKey(apiKey);

	if (!isKeyValid) throw { code: "Anauthorized", message: "Api key inválida." };

	const isEmployeeRegistred = await findById(employeeId);

	if (!isEmployeeRegistred)
		throw { code: "NotFound", message: "Empregado não encontrado" };

	const cardsOfEmployee = await cardRepository.findByTypeAndEmployeeId(
		type,
		employeeId
	);

	if (cardsOfEmployee)
		throw {
			code: "Conflict",
			message: "Cartão já registrado para esse usuário.",
		};

	const cardholderName = await cardName(isEmployeeRegistred.fullName);
	const expirationDate = await expireDate();
	const securityCode = cryptr.encrypt(faker.finance.creditCardCVV());
	const number = faker.finance.creditCardNumber("63[7-9]#-####-####-###L");

	await cardRepository.insert({
		employeeId,
		number,
		cardholderName,
		securityCode,
		expirationDate,
		isVirtual: false,
		isBlocked: false,
		type,
	});
}

async function cardName(name: string) {
	const separateName = name.split(" ").filter((elem) => elem.length >= 3);

	const nameForCard = separateName
		.map((elem: string, index: number, array: []) => {
			if (index !== 0 && index !== array.length - 1) {
				return elem.slice(0, 1);
			} else {
				return elem;
			}
		})
		.join(" ")
		.toUpperCase();

	return nameForCard;
}

async function expireDate() {
	const expireDate = new Date();
	const year = String(expireDate.getFullYear() + 5);
	const month = expireDate.getMonth();

	return `${month}/${year.slice(-2)}`;
}

export async function activateCard(
	id: number,
	newPassword: string,
	code: string
) {
	const cryptr = new Cryptr(process.env.SECRET);
	const card = await cardRepository.findById(id);

	if (!card) throw { code: "NotFound", message: "Cartão não encontrado." };

	if (checkExpirationDate(card.expirationDate))
		throw { code: "BadRequest", message: "Cartão expirado." };

	if (card.password)
		throw { code: "BadRequest", message: "Cartão já foi ativado." };

	const cvc = cryptr.decrypt(card.securityCode);

	if (cvc !== code) throw { code: "Anauthorized", message: "CVC incorreto." };

	if (newPassword.length !== 4)
		throw { code: "WrongType", message: "A senha deve conter 4 digitos." };

	const password = cryptr.encrypt(newPassword);

	await cardRepository.update(id, { password });
}

export function checkExpirationDate(expirationDate: string) {
	const cardDate = expirationDate.split("/");
	const date = new Date();
	const year = date.getFullYear();
	const month = date.getMonth();
	const actualDate = new Date(year, month);

	const expirationDateFromCard = new Date(
		Number(`20${cardDate[1]}`),
		Number(cardDate[0])
	);

	if (actualDate > expirationDateFromCard) {
		return true;
	} else {
		return false;
	}
}

export async function sendCards(id: number, passwords: string[]) {
	const cryptr = new Cryptr(process.env.SECRET);
	const cards = await cardRepository.findByEmploeeId(id);

	if (!cards.length) return {};

	const sendInformations = cards.map((elem, index) => {
		const decodedPassword = cryptr.decrypt(elem.password);

		if (passwords.some((elem) => elem == decodedPassword)) {
			const numberWithoutDash = elem.number.split("-").join(" ");

			return {
				number: numberWithoutDash,
				cardholderName: elem.cardholderName,
				expirationDate: elem.expirationDate,
				securityCode: cryptr.decrypt(elem.securityCode),
			};
		} else {
			return "Senha/Cartão inválidos";
		}
	});

	return { cards: sendInformations };
}

export async function sendBalance(id: number) {
	const card = await cardRepository.findById(id);

	if (!card) throw { code: "NotFound", message: "Cartão não encontrado." };

	const transactions = await paymentRepository.findByCardId(id);

	let totalTransactions: number;

	for await (const balance of transactions) {
		totalTransactions += balance.amount;
	}

	const recharges = await rechargeRepository.findByCardId(id);

	let totalRecharges: number;

	for await (const balance of recharges) {
		totalRecharges += balance.amount;
	}

	return {
		balance: totalRecharges - totalTransactions,
		transactions,
		recharges,
	};
}

export async function blockCard(id: number, password: string) {
	const cryptr = new Cryptr(process.env.SECRET);

	const card = await cardRepository.findById(id);

	if (!card) throw { code: "NotFound", message: "Cartão não encontrado." };

	const decodedPassword = cryptr.decrypt(card.password);

	if (decodedPassword !== password)
		throw { code: "Anauthorized", message: "Senha incorreta." };

	if (checkExpirationDate(card.expirationDate))
		throw { code: "BadRequest", message: "Cartão expirado." };

	if (card.isBlocked)
		throw { code: "BadRequest", message: "Cartão já bloqueado." };

	await cardRepository.update(id, { isBlocked: true });
}

export async function unlockCard(id: number, password: string) {
	const cryptr = new Cryptr(process.env.SECRET);

	const card = await cardRepository.findById(id);

	if (!card) throw { code: "NotFound", message: "Cartão não encontrado." };

	const decodedPassword = cryptr.decrypt(card.password);

	if (decodedPassword !== password)
		throw { code: "Anauthorized", message: "Senha incorreta." };

	if (checkExpirationDate(card.expirationDate))
		throw { code: "BadRequest", message: "Cartão expirado." };

	if (!card.isBlocked)
		throw { code: "BadRequest", message: "Cartão já está desbloqueado." };

	await cardRepository.update(id, { isBlocked: false });
}
