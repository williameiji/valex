import { Request, Response } from "express";
import * as cardServices from "../services/cardsServices.js";

export async function newCard(req: Request, res: Response) {
	const apiKey = res.locals.key;
	const typeCard = req.body.type;
	const idEmployee = Number(req.body.id);

	await cardServices.newCard(apiKey, typeCard, idEmployee);

	res.sendStatus(201);
}

export async function activateCard(req: Request, res: Response) {
	const body = req.body;

	await cardServices.activateCard(Number(body.id), body.password, body.cvc);

	res.sendStatus(202);
}

export async function sendCards(req: Request, res: Response) {
	const { id } = req.params;
	const { passwords } = req.body;

	const cards = await cardServices.sendCards(Number(id), passwords);

	res.status(200).send(cards);
}

export async function sendBalance(req: Request, res: Response) {
	const { id } = req.params;

	const balance = await cardServices.sendBalance(Number(id));

	res.status(200).send(balance);
}

export async function blockCard(req: Request, res: Response) {
	const data = req.body;

	await cardServices.blockCard(Number(data.id), data.password);

	res.sendStatus(200);
}

export async function unlockCard(req: Request, res: Response) {
	const data = req.body;

	await cardServices.unlockCard(Number(data.id), data.password);

	res.sendStatus(200);
}

export async function newVirtualCard(req: Request, res: Response) {
	const data = req.body;

	await cardServices.newVirtualCard(Number(data.id), data.password);

	res.sendStatus(201);
}

export async function deleteVirtualCard(req: Request, res: Response) {
	const { id } = req.params;
	const data = req.body;

	await cardServices.deleteVirtualCard(Number(id), data.password);

	res.sendStatus(202);
}
