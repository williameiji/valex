import { Request, Response } from "express";
import * as cardService from "../services/cardsServices.js";

export async function newCard(req: Request, res: Response) {
	const apiKey = res.locals.key;
	const typeCard = req.body.type;
	const idEmployee = Number(req.body.id);

	await cardService.newCard(apiKey, typeCard, idEmployee);

	res.sendStatus(201);
}

export async function activateCard(req: Request, res: Response) {
	const body = req.body;

	await cardService.activateCard(Number(body.id), body.password, body.cvc);

	res.sendStatus(202);
}