import { MaxLength, Length } from "class-validator";
import { MyContext } from "../interfaces/MyContext";
import { isAuth } from "../utils/auth";
import {
	Resolver,
	Query,
	UseMiddleware,
	Ctx,
	Field,
	InputType,
	Mutation,
	Arg,
} from "type-graphql";
import { getUser } from "./helpers";
import { Die } from "../entity/Die";
import { DieSides } from "../types";

@InputType()
export class DiceInput {
	@Field()
	@MaxLength(30)
	name: string;

	@Field({ nullable: true })
	@Length(10, 255)
	description?: string;

	@Field()
	sides: DieSides;
}

@Resolver()
export class DiceResolver {
	@Query(() => [Die])
  @UseMiddleware(isAuth)
	async getDice(@Ctx() { payload }: MyContext) {
		try {
			const userId = payload!.userId;
			const user = await getUser(userId);

			return user.dice;
		} catch (err) {
			throw new Error(err);
		}
	}
	@Query(() => Die)
	@UseMiddleware(isAuth)
	async getDie(@Arg("name") name: string) {
		try {
			const die = await Die.findOne({ where: { name } });
			if (!die) {
				throw new Error("Could Not Find This Die.");
			}
			return die;
		} catch (err) {
			throw new Error(err);
		}
	}
	@Mutation(() => Die)
	@UseMiddleware(isAuth)
	// At this time, A Dice Set will always create a Set of Dice.
	async createDie(
		@Ctx() { payload }: MyContext,
		@Arg("diceData") diceData: DiceInput
	) {
		try {
			const userId = payload!.userId;
			const user = await getUser(userId);
			const dieExists = user.dice.filter(
				(die) => die.name === diceData.name
			).length;
			if (dieExists) {
				throw new Error("A die with this name Already Exists.");
			}

			let die = await Die.create({ ...diceData, user });
			return await die.save();
		} catch (err) {
			throw new Error(err);
		}
	}
  @Mutation(() => Boolean)
	@UseMiddleware(isAuth)
  // need to block others from being able to delete w/ Auth!
	async deleteDie(@Arg("id") id: string) {
    try {
      const die = await Die.findOne({ where: { id } });
      if (!die) throw new Error("Die Not Found!");
  
      await die.remove();
      return true;
    } catch(err) {
      throw new Error(err);
    }
	}
}
