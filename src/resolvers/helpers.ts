import { User } from "../entity/User";

export async function getUser(id: string) {
  const user = (await User.findOne({
    where: { id },
    relations: ["gameSessions", "dice"],
  })) as User;
  
  if (!user) {
    throw new Error("Could Not Find User!")
  }

  return user;
}