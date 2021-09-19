import { hash, compare } from "bcryptjs";
import { createAccessToken, createRefreshToken, isAuth, sendRefreshToken } from "../utils/auth";
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

			await User.insert({
				email,
				password: hashedPass,
			});
			return true;
		} catch (err) {
			console.error(err);
			return false;
		}
	}
    
	@Mutation(() => LoginResponse)
	async login(
		@Arg("email") email: string,
		@Arg("password") password: string,
		@Ctx() { res }: MyContext
	): Promise<LoginResponse> {
		const user = await User.findOne({ where: { email } });
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
}
