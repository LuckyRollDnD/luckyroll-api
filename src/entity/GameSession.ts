import { Length, MaxLength } from "class-validator";
import { Field, InputType, Int, ObjectType } from "type-graphql";
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from "typeorm";
import { DiceRoll } from "./DiceRoll";
import { User } from "./User";

@ObjectType()
@Entity("game_sessions")
export class GameSession extends BaseEntity {
	
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id: number;

	@Field()
	@Column("text")
	title: string;

	@Field({nullable: true})
	@Column("text", {nullable: true})
	description: string;
	
  @Field()
	@Column("bool")
	active: boolean;

	@Field()
	@CreateDateColumn()
	createdAt: Date;

	@Field()
	@UpdateDateColumn()
	updatedAt: Date;
	

  @Field(() => [DiceRoll], {nullable: true})
  @OneToMany(() => DiceRoll, (diceRoll) => diceRoll.gameSession, {cascade: true})
  diceRolls: DiceRoll[];
	
	@Field(() => User)
	@ManyToOne(() => User, user => user.gameSessions)
	user: User;


}

@InputType()
export class GameSessionInput {
	@Field()
	@MaxLength(30)
	title: string;

	@Field({ nullable: true })
	@Length(10, 255)
	description?: string;
}