import { isAuth } from "../utils/auth";
import {
	Resolver,
	Query,
	UseMiddleware,
	Field,
	InputType,
	Mutation,
	Arg,
} from "type-graphql";
import { Die } from "../entity/Die";
import { DiceRoll } from "../entity/DiceRoll";
import { GameSession } from "../entity/GameSession";

@InputType()
export class DiceRollInput {
	@Field()
	score: number;

	@Field()
	gameSessionID: number;

	@Field()
	dieID: number;
}

@Resolver()
export class DiceRollResolver {
	@Query(() => [DiceRoll])
	@UseMiddleware(isAuth)
	async diceRolls(@Arg("diceRollData") diceRollData: DiceRollInput) {
		try {
			const diceRolls = await DiceRoll.find({
				where: {
					gameSession: { id: diceRollData.gameSessionID },
					die: { id: diceRollData.dieID },
				},
			});
			return diceRolls;
		} catch (err) {
			throw new Error(err);
		}
	}
	@Mutation(() => DiceRoll)
	@UseMiddleware(isAuth)
	// At this time, A Dice Set will always create a Set of Dice.
	async createDiceRoll(@Arg("diceData") DiceRollData: DiceRollInput) {
		const { score, dieID, gameSessionID } = DiceRollData;
		try {
			const die = await Die.findOne({ where: { id: dieID } });
			if (!die) {
				throw new Error("Could not Find The Die that you Rolled...");
			}

			const gameSession = await GameSession.findOne({
				where: { id: gameSessionID },
			});
			if (gameSession && !gameSession.active) {
				throw new Error(
					"This Game Session is over. You Cannot Roll for this Session."
				);
			}
			if (!gameSession) {
				throw new Error("Could not Find Game Session.");
			}
			if (score < 1 || score > die.sides) {
				throw new Error("Invalid Roll Given. Please Give a Valid Number.");
			}
			const diceRoll = await DiceRoll.create({
				die,
				gameSession,
				score,
			});
			return await diceRoll.save();
		} catch (err) {
			throw new Error(err);
		}
	}
	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	// need to block others from being able to delete w/ Auth!
	async deleteRoll(@Arg("id") id: string) {
		try {
			const diceRoll = await DiceRoll.findOne({ where: { id } });
			if (!diceRoll) throw new Error("Dice Roll Not Found.");

			await diceRoll.remove();
			return true;
		} catch (err) {
			throw new Error(err);
		}
	}
}
