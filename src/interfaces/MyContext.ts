import { Request, Response } from "express";

export class MyContext {
	req: Request;
	res: Response;
	payload?: { userId: string };
}
