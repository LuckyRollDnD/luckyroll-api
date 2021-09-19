import { sign, verify } from "jsonwebtoken";
import { MyContext } from "src/interfaces/MyContext";
import { Middleware } from "type-graphql/dist/interfaces/Middleware";
import { User } from "../entity/User";
import {Response} from "express"
// import { getConnection } from "typeorm";
export const createAccessToken = (user: User) => {
	return sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET!, {
		expiresIn: "60m",
	});
};

export const createRefreshToken = (user: User) => {
	return sign({ userId: user.id, tokenVersion: user.tokenVersion }, process.env.REFRESH_TOKEN_SECRET!, {
		expiresIn: "7d",
	});
};

export const isAuth: Middleware<MyContext> = ({ context }, next) => {
	const authorization = context.req.headers["authorization"];
	if (!authorization) {
		throw new Error("Not Authenticated!");
	}

	try {
		const token = authorization.split(" ")[1];
		const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!);

		context.payload = payload as any;
	} catch (err) {
		throw new Error("Not Authenticated!");
	}
	return next();
};


export const sendRefreshToken = (res: Response, token: string) => {
	res.cookie("jid", token, {
		// not accessible by JS
		httpOnly: true,
	});
}

// This can be called to Revoke Refresh Token
// const revokeRefreshTokensForUser = async (userId: number): Boolean  => {
// 	await getConnection()
// 		.getRepository(User)
// 		.increment({id: userId}, 'tokenVersion', 1);
// 	return true;
// }