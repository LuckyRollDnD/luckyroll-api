
import { Field, Int, ObjectType } from "type-graphql";
import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne} from "typeorm";
import { Die } from "./Die";
import { GameSession } from "./GameSession";

@ObjectType()
@Entity("dice_rolls")
export class DiceRoll extends BaseEntity {
	
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id: number;
  
  @Field(() => Int)
  @Column("int", {default: 0})
  value: number;

  @Field(() => GameSession)
	@ManyToOne(() => GameSession, gameSession => gameSession.diceRolls)
	gameSession: GameSession;
  
  @Field(() => Die)
	@ManyToOne(() => Die, die => die.diceRolls)
	die: Die;

  
}