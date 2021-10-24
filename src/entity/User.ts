import { Field, Int, ObjectType } from "type-graphql";
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	BaseEntity,
	OneToMany,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";
import { Die } from "./Die";
import { GameSession } from "./GameSession";

@ObjectType()
@Entity("users")
export class User extends BaseEntity {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id: number;

	// @Column("text")
	// username: string;
	@Field()
	@Column("text", { unique: true })
	email: string;

	@Column("text")
	password: string;

	@Column("int", { default: 0 })
	tokenVersion: number;

	@Field()
	@CreateDateColumn()
	createdAt: Date;

	@Field()
	@UpdateDateColumn()
	updatedAt: Date;

	@Field(() => [GameSession], { nullable: true, defaultValue: [] })
	@OneToMany(() => GameSession, (gameSession) => gameSession.user, {
		cascade: true,
	})
	gameSessions: GameSession[];

	@Field(() => [Die], { defaultValue: [] })
	@OneToMany(() => Die, (die) => die.user, { cascade: true })
	dice: Die[];
}
