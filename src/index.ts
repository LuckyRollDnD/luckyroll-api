import "reflect-metadata";
import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import { ApolloServer, ExpressContext } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { ApolloServerPluginDrainHttpServer, Config } from "apollo-server-core";
import { createConnection } from "typeorm";
import cookieParser from "cookie-parser";

import { UserResolver } from "./resolvers/UserResolvers";
import { GameSessionResolver } from "./resolvers/GameSessionResolver";
import { refreshRequest } from "./utils/middlewareUtils";
import { DiceResolver } from "./resolvers/DiceResolver";
import { DiceRollResolver } from "./resolvers/DiceRollResolver";

const port = 4000;
(async () => {
	const app = express();
	const httpServer = http.createServer(app);
	app.use(
		cors({
			// origin: "http://localhost:19000",
			origin: "*",
			credentials: true,
		})
	);
	app.use(cookieParser());
	app.get("/", (_req, res) => res.send("hello"));

	// refresh JWT
	app.post("/refresh_token", refreshRequest);
	// TypeORM connection to DB
	await createConnection();
	// APOLLO SERVER
	const resolvers: any = [
		UserResolver,
		GameSessionResolver,
		DiceResolver,
		DiceRollResolver,
	];
	const apolloServer = new ApolloServer({
		schema: await buildSchema({ resolvers }),
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
