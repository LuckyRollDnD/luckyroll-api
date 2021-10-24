// import { Field, Int, ObjectType } from "type-graphql";
// import {
// 	Entity,
// 	PrimaryGeneratedColumn,
// 	Column,
// 	BaseEntity,
// 	CreateDateColumn,
// 	UpdateDateColumn,
//   OneToMany,
// } from "typeorm";
// import { Die } from "./Die";

// @ObjectType()
// @Entity("dice_sets")
// export class DiceSet extends BaseEntity {
// 	@Field(() => Int)
// 	@PrimaryGeneratedColumn()
// 	id: number;

// 	@Field({ nullable: true })
// 	@Column("text", { nullable: true })
// 	description: string;
  
// 	@Field()
// 	@CreateDateColumn()
// 	createdAt: Date;

// 	@Field()
// 	@UpdateDateColumn()
// 	updatedAt: Date;


// 	@Field(() => [Die], { nullable: true })
// 	@OneToMany(() => Die, (die) => die.diceSet, {
// 		cascade: true,
// 	})
// 	dice: Die[];
// }
