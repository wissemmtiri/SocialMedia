import { RoleEnum } from 'src/enums/role.enum';
import { TimestampEntities } from 'src/generics/timestamp.entities';
import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, OneToMany, JoinTable } from 'typeorm';
import { FriendRequest } from './friend-request.entity';

@Entity('users')
export class User extends TimestampEntities {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true
    })
    username: string;

    @Column({
        unique: true
    })
    email: string;

    @Column()
    password: string;

    @Column()
    salt: string;

    @Column({
        default: ''
    })
    bio: string;

    @Column({
        default: ''
    })
    token: string;

    @Column({
        default: RoleEnum.USER
    })
    role: RoleEnum
    //-----------------------------------------RELATIONS
    @OneToMany(
        () => FriendRequest,
        (request) => request.sender,
        {
            cascade: true
        }
    )
    sentFriendRequests: FriendRequest[];

    @OneToMany(
        () => FriendRequest,
        (request) => request.receiver,
        {
            cascade: true
        }
    )
    recievedFriendRequests: FriendRequest[];

    @ManyToMany(
        () => User,
        friend => friend.friendList,
    )
    @JoinTable()
    friendList: User[];
}