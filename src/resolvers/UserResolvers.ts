import { hash, compare } from "bcryptjs";
import {
	Arg,
	Ctx,
	Field,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	UseMiddleware,
} from "type-graphql";
import { verify } from "jsonwebtoken";

import {
	createAccessToken,
	createRefreshToken,
	isAuth,
	sendRefreshToken,
} from "../utils/auth";
import { User } from "../entity/User";
import { MyContext } from "../interfaces/MyContext";

@ObjectType()
class LoginResponse {
	@Field()
	accessToken: string;
}

@Resolver()
export class UserResolver {
	@Query(() => String)
	hello() {
		return "hi!";
	}

	@Query(() => String)
	@UseMiddleware(isAuth)
	bye(@Ctx() { payload }: MyContext) {
		console.log({ payload });
		return `Your User ID is ${payload!.userId}`;
	}

	@Query(() => [User])
	users() {
		return User.find();
	}
	// @Query()
	@Mutation(() => Boolean)
	async register(
		@Arg("email") email: string,
		@Arg("password") password: string
	) {
		try {
			const hashedPass = await hash(password, 12);
			const lowerEmail = email.toLowerCase();

			// find if user exists
			const user = await User.findOne({ email: lowerEmail });
			if (user) {
				throw new Error("This account already exists.");
			}

			await User.insert({
				email: lowerEmail,
				password: hashedPass,
			});
			return true;
		} catch (err) {
			throw new Error(`Error: ${err}`);
		}
	}

	@Mutation(() => LoginResponse)
	async login(
		@Arg("email") email: string,
		@Arg("password") password: string,
		@Ctx() { res }: MyContext
	): Promise<LoginResponse> {
		// lowercase the email to ensure it matches from DB
		const lowerEmail = email.toLowerCase();

		const user = await User.findOne({ where: { email: lowerEmail } });
		console.log({ user });
		if (!user) {
			// Throw 404?
			throw new Error("Could Not Find User");
		}
		const valid = await compare(password, user.password);

		if (!valid) {
			throw new Error("Bad Password.");
		}

		// Login Successful Now.
		sendRefreshToken(res, createRefreshToken(user));

		return {
			accessToken: createAccessToken(user),
		};
	}

	@Query(() => User, { nullable: true })
	me(@Ctx() context: MyContext) {
		const authorization = context.req.headers["authorization"];

		if (!authorization) {
			return null;
		}

		try {
			const token = authorization.split(" ")[1];
			const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
			return User.findOne(payload.userId);
		} catch (err) {
			console.log(err);
			return null;
		}
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async deleteAccount(@Arg("id") id: string) {
    const  user = await User.findOne({ where: {id}});
    if (!user) throw new Error("User Not Found!");

    await user.remove();
    return true;
  }
}
