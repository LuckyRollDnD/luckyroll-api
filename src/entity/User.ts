import { Field, Int, ObjectType } from "type-graphql";
import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany} from "typeorm";
import { GameSession } from "./GameSession";

@ObjectType()
@Entity("users")
export class User extends BaseEntity{

    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    // @Column("text")
    // username: string;
    @Field()
    @Column("text", {unique: true})
    email: string;
    
    @Column("text")
    password: string;

    @Column("int", {default: 0})
    tokenVersion: number;

    @Field(() => [GameSession], {nullable: true})
    @OneToMany(() => GameSession, (gameSession) => gameSession.user, {cascade: true})
    gameSessions: GameSession[];
}
