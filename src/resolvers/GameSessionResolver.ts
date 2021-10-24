import {
	Arg,
	Ctx,
	Field,
	InputType,
	Mutation,
	Query,
	Resolver,
	UseMiddleware,
} from "type-graphql";

import { isAuth } from "../utils/auth";
import { GameSession } from "../entity/GameSession";
import { MyContext } from "../interfaces/MyContext";
import { getUser } from "./helpers";
import { MaxLength, Length } from "class-validator";


@InputType()
export class GameSessionInput {
	@Field()
	@MaxLength(30)
	title: string;

	@Field({ nullable: true })
	@Length(10, 255)
	description?: string;
}
@Resolver()
export class GameSessionResolver {
	@Query(() => [GameSession])
	@UseMiddleware(isAuth)
	// get user's gamesessions.
	async gameSessions(@Ctx() { payload }: MyContext) {
		const userId = payload!.userId;
		const user = await getUser(userId);

		if (!user.gameSessions.length) {
			console.log("User does not have any GameSessions.");
			return [];
		}
		return user.gameSessions;
	}

	@Query(() => GameSession)
	@UseMiddleware(isAuth)
	async gameSession(@Arg("gameSessionId") gameSessionId: string) {
		try {
			const gameSession = await GameSession.findOne({
				where: { id: gameSessionId },
			});
			console.log({ gameSession });
			if (!gameSession) {
				throw new Error("Could not find Game Session");
			}
			return gameSession;
		} catch (err) {
			throw new Error(err);
		}
	}

	@Mutation(() => GameSession)
	@UseMiddleware(isAuth)
	async createGameSession(
		@Arg("newGameSessionData") newGSData: GameSessionInput,
		@Ctx() { payload }: MyContext
	) {
		try {
			const userId = payload!.userId;
			const user = await getUser(userId);
			const filteredSessions = user.gameSessions.filter(
				(session) => session.title === newGSData.title
			);
			if (filteredSessions.length) {
				throw new Error("This Session Name Exists!");
			}
			const entity = await GameSession.create({
				...newGSData,
				user,
				active: true,
			});
			console.log({ entity });
			const newGameSession = await entity.save();

			return newGameSession;
		} catch (err) {
			console.error(`Issue with Creating Session: ${err}`);
			throw new Error(err);
		}
	}

	@Mutation(() => GameSession)
	@UseMiddleware(isAuth)
	async finishGameSession(@Arg("id") id: string) {
		const gameSession = await GameSession.findOne({ where: { id } });

		if (!gameSession) {
			throw new Error("Game Session Not Found");
		}

		Object.assign(gameSession, { active: false });
		await gameSession.save();
		return gameSession;
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async deleteGameSession(@Arg("id") id: string) {
		const gameSession = await GameSession.findOne({ where: { id } });
		if (!gameSession) throw new Error("Game Session Not Found!");

		await gameSession.remove();
		return true;
	}
}
