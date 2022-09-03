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
	await isApiKeyValid(apiKey);

	const employeeData = await isEmployeeRegistered(employeeId);

	await checkCardsOfEmployee(type, employeeId);

	const cardholderName = await cardName(employeeData.fullName);
	const number = faker.finance.creditCardNumber("63[7-9]#-####-####-###L");

	await populateNewCard(
		employeeId,
		number,
		cardholderName,
		type,
		null,
		false,
		false,
		null
	);
}

export async function activateCard(
	id: number,
	newPassword: string,
	cvc: string
) {
	const cryptr = new Cryptr(process.env.SECRET);

	const card = await getCardInformation(id);

	isCardRegistered(card);

	isCardExpired(card.expirationDate);

	checkCardType(card.isVirtual);

	isCardActive(card.password);

	await checkDecodeCvc(card.securityCode, cvc);

	checkLengthOfPassword(newPassword);

	const password = cryptr.encrypt(newPassword);

	await updateCardInformations(id, { password });
}

export async function sendCards(id: number, passwords: string) {
	const stringToArray = JSON.parse(passwords);
	const passwordsList = JSON.parse(stringToArray);

	const cards = await cardRepository.findByEmploeeId(id);

	const sendCardsInformations = await getAllCardInformationFromEmploee(
		cards,
		passwordsList
	);

	return { cards: sendCardsInformations };
}

export async function sendBalance(id: number) {
	const card = await getCardInformation(id);

	isCardRegistered(card);

	const { totalTransactions, transactions } = await calculateTotalTransactions(
		id
	);

	const { totalRecharges, recharges } = await calculateTotalRecharges(id);

	return {
		balance: totalRecharges - totalTransactions,
		transactions,
		recharges,
	};
}

export async function blockCard(id: number, password: string) {
	const card = await getCardInformation(id);

	isCardRegistered(card);

	await checkDecodePassword(card.password, password);

	isCardExpired(card.expirationDate);

	if (card.isBlocked)
		throw { code: "BadRequest", message: "Cartão já bloqueado." };

	await updateCardInformations(id, { isBlocked: true });
}

export async function unlockCard(id: number, password: string) {
	const card = await getCardInformation(id);

	isCardRegistered(card);

	await checkDecodePassword(card.password, password);

	isCardExpired(card.expirationDate);

	if (!card.isBlocked)
		throw { code: "BadRequest", message: "Cartão já está desbloqueado." };

	await updateCardInformations(id, { isBlocked: false });
}

export async function newVirtualCard(id: number, password: string) {
	const card = await getCardInformation(id);

	isCardRegistered(card);

	await checkDecodePassword(card.password, password);

	const cardNumber = faker.finance.creditCardNumber("master");

	await populateNewCard(
		card.employeeId,
		cardNumber,
		card.cardholderName,
		card.type,
		card.password,
		true,
		false,
		card.id
	);
}

export async function deleteVirtualCard(id: number, password: string) {
	const card = await getCardInformation(id);

	await checkDecodePassword(card.password, password);

	if (!card.isVirtual)
		throw {
			code: "BadRequest",
			message: "Somente cartões virtuais podem ser excluídos!",
		};

	await removeVirtualCard(id);
}

//api

export async function isApiKeyValid(apiKey: string) {
	const isKeyValid = await findByApiKey(apiKey);

	if (!isKeyValid) throw { code: "Anauthorized", message: "Api key inválida." };
}

async function isEmployeeRegistered(employeeId: number) {
	const isEmployeeRegistred = await findById(employeeId);

	if (!isEmployeeRegistred)
		throw { code: "NotFound", message: "Empregado não encontrado" };

	return isEmployeeRegistred;
}

async function checkCardsOfEmployee(
	type: cardRepository.TransactionTypes,
	employeeId: number
) {
	const cardsOfEmployee = await cardRepository.findByTypeAndEmployeeId(
		type,
		employeeId
	);

	if (cardsOfEmployee)
		throw {
			code: "Conflict",
			message: "Cartão já registrado para esse usuário.",
		};
}

async function updateCardInformations(id: number, item: object) {
	await cardRepository.update(id, item);
}

async function removeVirtualCard(id: number) {
	await cardRepository.remove(id);
}

export async function getCardInformation(id: number) {
	return await cardRepository.findById(id);
}

async function populateNewCard(
	employeeId: number,
	number: string,
	cardholderName: string,
	type: cardRepository.TransactionTypes,
	password?: string,
	isVirtual?: boolean,
	isBlocked?: boolean,
	originalCardId?: number
) {
	const cryptr = new Cryptr(process.env.SECRET);

	await cardRepository.insert({
		employeeId,
		number,
		cardholderName,
		securityCode: cryptr.encrypt(faker.finance.creditCardCVV()),
		expirationDate: await expireDate(),
		password,
		isVirtual,
		originalCardId,
		isBlocked,
		type,
	});
}

async function calculateTotalTransactions(id: number) {
	const transactions = await paymentRepository.findByCardId(id);

	let totalTransactions: number = 0;

	for await (const balance of transactions) {
		totalTransactions += balance.amount;
	}

	return { totalTransactions, transactions };
}

async function calculateTotalRecharges(id: number) {
	const recharges = await rechargeRepository.findByCardId(id);

	let totalRecharges: number = 0;

	for await (const balance of recharges) {
		totalRecharges += balance.amount;
	}

	return { totalRecharges, recharges };
}

//api

//verifications

export function isCardBlocked(isBlocked: boolean) {
	if (isBlocked) throw { code: "BadRequest", message: "Cartão bloqueado." };
}

export function isCardActive(password: string) {
	if (password) throw { code: "BadRequest", message: "Cartão já foi ativado." };
}

export function isCardInactive(password: string) {
	if (!password) throw { code: "BadRequest", message: "Cartão inativo!" };
}

function checkLengthOfPassword(password: string) {
	if (password.length !== 4)
		throw { code: "WrongType", message: "A senha deve conter 4 digitos." };
}

export function isCardRegistered(card: object) {
	if (!card) throw { code: "NotFound", message: "Cartão não encontrado." };
}

export function isCardExpired(expirationDate: string) {
	if (checkExpirationDate(expirationDate))
		throw { code: "BadRequest", message: "Cartão expirado." };
}

export function checkCardType(isVirtual: boolean) {
	if (isVirtual)
		throw {
			code: "BadRequest",
			message: "Cartões virtuais não podem ser usados!",
		};
}

export async function checkDecodePassword(
	cardPassword: string,
	password: string
) {
	const cryptr = new Cryptr(process.env.SECRET);

	const decodedPassword = cryptr.decrypt(cardPassword);

	if (decodedPassword !== password)
		throw { code: "Anauthorized", message: "Senha incorreta" };
}

export async function checkDecodeCvc(cardCvc: string, cvc: string) {
	const cryptr = new Cryptr(process.env.SECRET);

	const decodedCvc = cryptr.decrypt(cardCvc);

	if (decodedCvc !== cvc)
		throw { code: "Anauthorized", message: "CVC incorreto." };
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

//verifications

async function getAllCardInformationFromEmploee(
	cards: any,
	passwords: number[]
) {
	const data = cards.map((elem: any, index: number) => {
		const cryptr = new Cryptr(process.env.SECRET);

		const decodedPassword = cryptr.decrypt(elem.password);

		if (String(passwords[index]) === decodedPassword) {
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

	return data;
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
	const month = (expireDate.getMonth() + 1).toString().padStart(2, "0");

	return `${month}/${year.slice(-2)}`;
}
