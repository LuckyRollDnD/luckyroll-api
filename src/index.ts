import "reflect-metadata";
import "dotenv/config";
import express from "express";
import http from "http";
import { ApolloServer, ExpressContext } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { ApolloServerPluginDrainHttpServer, Config } from "apollo-server-core";
import { createConnection } from "typeorm";
import cookieParser from "cookie-parser";

import { UserResolver } from "./resolvers/UserResolvers";
import { verify } from "jsonwebtoken";
import { User } from "./entity/User";
import {
	createAccessToken,
	createRefreshToken,
	sendRefreshToken,
} from "./utils/auth";

const port = 4000;
(async () => {
	const app = express();
	const httpServer = http.createServer(app);
	app.use(cookieParser());
	app.get("/", (_req, res) => res.send("hello"));
	// refresh JWT
	app.post("/refresh_token", async (req, res) => {
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
	});
	// TypeORM connection to DB
	await createConnection();

	// APOLLO SERVER
	const apolloServer = new ApolloServer({
		schema: await buildSchema({ resolvers: [UserResolver] }),
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
		// allow us to grab req and res from context in our resolvers
		context: ({ req, res }) => ({ req, res }),
	} as Config<ExpressContext>);

	await apolloServer.start();
	apolloServer.applyMiddleware({ app });

	// Sart Server
	await new Promise((resolve) => httpServer.listen({ port: port }, resolve));
	console.log(
		`🚀 Server ready at http://localhost:${port}${apolloServer.graphqlPath}`
	);
})();
