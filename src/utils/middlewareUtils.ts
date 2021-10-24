import { verify } from "jsonwebtoken";
import { User } from "../entity/User";
import {
	createAccessToken,
	createRefreshToken,
	sendRefreshToken,
} from "./auth";
import {Response, Request} from "express";

export async function refreshRequest(req: Request, res: Response) {
	const token = req.cookies.jid;
	if (!token) return res.send({ ok: false, accessToken: "" });

	let payload: any = null;
	try {
		payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
	} catch (err) {
		return res.send({ ok: false, accessToken: "" });
	}

	// Token Valid and send back Access Token
	const user = await User.findOne({ id: payload.userId });
	if (!user) {
		return res.send({ ok: false, accessToken: "" });
	}
	// If Token Version is not that of signed token, mark it invalid
	if (user.tokenVersion !== payload.tokenVersion) {
		return res.send({ ok: false, acessToken: "" });
	}
	sendRefreshToken(res, createRefreshToken(user));

	return res.send({ ok: true, accessToken: createAccessToken(user) });
}

