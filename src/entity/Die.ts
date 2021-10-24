import { Field, Int, ObjectType, registerEnumType } from "type-graphql";
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	OneToMany,
	CreateDateColumn,
	UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { DieSides } from "../types/index";
import { DiceRoll } from "./DiceRoll";
import { User } from "./User";

registerEnumType(DieSides, {
	name: "DieSides", // this one is mandatory
	description: "The Number of sides for a die", // this one is optional
});

@ObjectType()
@Entity("dice")
export class Die extends BaseEntity {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id: number;

	@Field()
	@Column("text")
	name: string;

	@Field({ nullable: true })
	@Column("text", { nullable: true })
	description: string;

	@Field(() => DieSides)
	@Column({
		type: "enum",
		enum: DieSides,
		default: DieSides.Six,
	})
	sides: DieSides;

	@Field()
	@CreateDateColumn()
	createdAt: Date;

	@Field()
	@UpdateDateColumn()
	updatedAt: Date;

	@Field(() => [DiceRoll], { nullable: true })
	@OneToMany(() => DiceRoll, (diceRoll) => diceRoll.die, { cascade: true })
	diceRolls: DiceRoll[];
  
  
	@Field(() => User)
	@ManyToOne(() => User, (user) => user.gameSessions,  {eager: true})
	user: User;
  
  // @Field(() => DiceSet)
  // @ManyToOne(() => DiceSet, (diceSet) => diceSet.dice,  {eager: true})
  // diceSet: DiceSet;
}
