import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('friend_requests')
export class FriendRequest {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(
        () => User,
        {
            eager: true
        }
    )
    @JoinColumn({ name: 'sender' })
    sender: User;

    @ManyToOne(
        () => User,
        {
            eager: true
        }
    )
    @JoinColumn({ name: 'receiver' })
    receiver: User;

    @CreateDateColumn(
        {
            update: false
        }
    )
    createdAt: Date;
}