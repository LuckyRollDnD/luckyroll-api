import { Field, Int, ObjectType } from "type-graphql";
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";
import { Die } from "./Die";
import { GameSession } from "./GameSession";
@ObjectType()
@Entity("dice_rolls")
export class DiceRoll extends BaseEntity {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id: number;

	@Field(() => Int)
	@Column("int", { default: 0 })
	score: number;

	@Field()
	@CreateDateColumn()
	createdAt: Date;

	@Field()
	@UpdateDateColumn()
	updatedAt: Date;

	@Field(() => GameSession)
	@ManyToOne(() => GameSession, (gameSession) => gameSession.diceRolls, {
		eager: true,
	})
	gameSession: GameSession;

	@Field(() => Die, { nullable: true})
	@ManyToOne(() => Die, (die) => die.diceRolls, { eager: true })
	die: Die;
}
