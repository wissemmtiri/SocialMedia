import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserAddDto } from './dto/user-add.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { loginCredsDto } from './dto/user-login.dto';
import { JwtService } from '@nestjs/jwt';
import { UpdateBioDto } from './dto/update-bio.dto';
import { UpdatePassDto } from './dto/update-pass.dto';
import { searchDto } from './dto/search.dto';
import { FriendRequest } from './entities/friend-request.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(FriendRequest)
        private friendRequestRepository: Repository<FriendRequest>,
        private JwtService: JwtService
    ) { }

    async getProfile(user: any) {
        const userdb = await this.userRepository.findOne({ where: { username: user.username } });
        return {
            "USERNAME": userdb.username,
            "EMAIL": userdb.email,
            "BIO": userdb.bio
        }
    }

    async updateBio(user: any, bio: UpdateBioDto) {
        try {
            const userdb = await this.userRepository.findOne({ where: { username: user.username } });
            userdb.bio = bio.bio;
            await this.userRepository.save(userdb);
            return { "Message": "Bio Updated Successfully" };
        } catch {
            throw new HttpException(
                'Something Went Wrong, Try Again Later',
                HttpStatus.NOT_ACCEPTABLE
            )
        }
    }

    async updatePassword(user: any, passwords: UpdatePassDto) {
        try {
            const userdb = await this.userRepository.findOne({ where: { username: user.username } });
            const verifyPass = await bcrypt.hash(passwords.oldPassword, userdb.salt || '');
            const newPass = await bcrypt.hash(passwords.newPassword, userdb.salt || '');

            if (userdb.password === verifyPass) {
                userdb.password = newPass;
                await this.userRepository.save(userdb);
                await this.logout(user);
                return { "Message": "Password Updated Successfully" };
            }
            else {
                throw new HttpException(
                    'Wrong Old Password',
                    HttpStatus.NOT_ACCEPTABLE
                )
            }
        } catch {
            throw new HttpException(
                'Something Went Wrong, Try Again Later',
                HttpStatus.NOT_ACCEPTABLE
            )
        }
    }

    async discover() {
        const users = await this.userRepository.find();
        users.forEach((user) => {
            delete user.password;
            delete user.salt;
            delete user.token;
            delete user.role;
            delete user.deletedAt;
            delete user.updatedAt;
            delete user.createdAt;
            delete user.id;
        })
        return users;
    }

    async search(searchParams: searchDto) {
        try {
            const query = this.userRepository.createQueryBuilder('user');
            query.andWhere('user.username LIKE :username', { username: `%${searchParams.username}%` });
            const users = await query.getMany();
            users.forEach((user) => {
                delete user.password;
                delete user.salt;
                delete user.token;
                delete user.role;
                delete user.deletedAt;
                delete user.updatedAt;
                delete user.createdAt;
                delete user.id;
            })
            return users;
        } catch {
            throw new HttpException(
                'Something Went Wrong, Try Again Later',
                HttpStatus.NOT_ACCEPTABLE
            )
        }
    }

    async getFriends(user: any) {
        const userdb = await this.userRepository.findOne({ where: { username: user.username }, relations: ['friendList'] });
        const friends = userdb.friendList;
        friends.forEach((friend) => {
            delete friend.password;
            delete friend.salt;
            delete friend.token;
            delete friend.role;
            delete friend.deletedAt;
            delete friend.updatedAt;
            delete friend.createdAt;
            delete friend.id;
        })
        return {
            "FRIENDS": friends,
            "NUMBER": friends.length
        };
    }

    async getRequests(user: any) {
        try {
            const userdb = await this.userRepository.findOne({ where: { username: user.username }, relations: ['recievedFriendRequests'] });
            const requests = userdb.recievedFriendRequests;
            requests.forEach((request) => {
                delete request.sender.password;
                delete request.sender.salt;
                delete request.sender.token;
                delete request.sender.role;
                delete request.sender.deletedAt;
                delete request.sender.updatedAt;
                delete request.sender.createdAt;
                delete request.sender.id;

                delete request.receiver.password;
                delete request.receiver.salt;
                delete request.receiver.token;
                delete request.receiver.role;
                delete request.receiver.deletedAt;
                delete request.receiver.updatedAt;
                delete request.receiver.createdAt;
                delete request.receiver.id;
            })
            return {
                "REQUESTS": requests,
                "NUMBER": requests.length
            }
        } catch {
            throw new HttpException(
                'Something Went Wrong, Try Again Later',
                HttpStatus.NOT_ACCEPTABLE
            )
        }
    }

    async getSentRequests(user: any) {
        try {
            const userdb = await this.userRepository.findOne({ where: { username: user.username }, relations: ['sentFriendRequests'] });
            const requests = userdb.sentFriendRequests;
            requests.forEach((request) => {
                delete request.sender.password;
                delete request.sender.salt;
                delete request.sender.token;
                delete request.sender.role;
                delete request.sender.deletedAt;
                delete request.sender.updatedAt;
                delete request.sender.createdAt;
                delete request.sender.id;

                delete request.receiver.password;
                delete request.receiver.salt;
                delete request.receiver.token;
                delete request.receiver.role;
                delete request.receiver.deletedAt;
                delete request.receiver.updatedAt;
                delete request.receiver.createdAt;
                delete request.receiver.id;
            })
            return {
                "REQUESTS": requests,
                "NUMBER": requests.length
            }
        } catch {
            throw new HttpException(
                'Something Went Wrong, Try Again Later',
                HttpStatus.NOT_ACCEPTABLE
            )
        }
    }

    async sendRequest(user: any, username: string) {
        try {
            const current_user = await this.userRepository.findOne({ where: { username: user.username }, relations: ['sentFriendRequests', 'friendList'] });
            const user1 = await this.userRepository.findOne({ where: { username: username["username"] }, relations: ['recievedFriendRequests', 'friendList'] });
            if (user1) {
                const request = new FriendRequest();
                request.sender = current_user;
                request.receiver = user1;
                if (current_user.friendList.includes(user1)) {
                    throw new HttpException(
                        'Already Friends',
                        HttpStatus.NOT_ACCEPTABLE
                    )
                } else if (current_user.sentFriendRequests.includes(request)) {
                    throw new HttpException(
                        'Request Already Sent',
                        HttpStatus.NOT_ACCEPTABLE
                    )
                } else {
                    current_user.sentFriendRequests.push(request);
                    user1.recievedFriendRequests.push(request);
                    await this.friendRequestRepository.save(request);
                    await this.userRepository.save(current_user);
                    await this.userRepository.save(user1);
                    return { "Message": "Request Sent Successfully" };
                }
            }
            else {
                throw new HttpException(
                    'User Not Found',
                    HttpStatus.NOT_FOUND
                )
            }
        } catch {
            throw new HttpException(
                'Something Went Wrong, Try Again Later',
                HttpStatus.NOT_ACCEPTABLE
            )
        }
    }

    async acceptRequest(user: any, id: number) {
        try {
            const current_user = await this.userRepository.findOne({ where: { username: user.username }, relations: ['recievedFriendRequests', 'friendList'] });
            const request = await this.friendRequestRepository.findOne({ where: { id: id["id"] }, relations: ['sender', 'receiver'] });
            const sender = await this.userRepository.findOne({ where: { username: request.sender.username }, relations: ['sentFriendRequests', 'friendList'] });

            if (request) {
                if (request.receiver.id === current_user.id) {
                    current_user.friendList.push(sender);
                    sender.friendList.push(current_user);
                    sender.sentFriendRequests.splice(sender.sentFriendRequests.indexOf(request), 1);
                    current_user.recievedFriendRequests.splice(current_user.recievedFriendRequests.indexOf(request), 1);
                    await this.userRepository.save(current_user);
                    await this.userRepository.save(sender);
                    await this.friendRequestRepository.delete(request);
                    return { "Message": "Request Accepted Successfully" };
                } else {
                    throw new HttpException(
                        'Request Not Found',
                        HttpStatus.NOT_FOUND
                    )
                }
            }
        } catch {
            throw new HttpException(
                'Something Went Wrong, Try Again Later',
                HttpStatus.NOT_ACCEPTABLE
            )
        }
    }

    async rejectRequest(user: any, id: number) {
        try {
            const current_user = await this.userRepository.findOne({ where: { username: user.username }, relations: ['recievedFriendRequests'] });
            const request = await this.friendRequestRepository.findOne({ where: { id: id["id"] }, relations: ['sender', 'receiver'] });
            const sender = await this.userRepository.findOne({ where: { username: request.sender.username }, relations: ['sentFriendRequests'] });

            if (request) {
                if (request.receiver.id === current_user.id) {
                    sender.sentFriendRequests.splice(sender.sentFriendRequests.indexOf(request), 1);
                    current_user.recievedFriendRequests.splice(current_user.recievedFriendRequests.indexOf(request), 1);
                    await this.userRepository.save(current_user);
                    await this.userRepository.save(sender);
                    await this.friendRequestRepository.delete(request);
                    return { "Message": "Request Rejected Successfully" };
                } else {
                    throw new HttpException(
                        'Request Not Found',
                        HttpStatus.NOT_FOUND
                    )
                }
            }
        } catch {
            throw new HttpException(
                'Something Went Wrong, Try Again Later',
                HttpStatus.NOT_ACCEPTABLE
            )
        }
    }
    //-----------------------------------------------------AUTHENTICATION
    async signup(signupCreds: UserAddDto) {
        try {
            const userdb = new User();
            userdb.username = signupCreds.username;
            userdb.email = signupCreds.email;
            userdb.salt = await bcrypt.genSalt();
            userdb.password = await bcrypt.hash(signupCreds.password, userdb.salt);

            await this.userRepository.save(userdb);
            return { "Message": "User Added Successfully" };
        }
        catch {
            throw new HttpException(
                'Error creating User',
                HttpStatus.NOT_ACCEPTABLE
            )
        }
    }

    async login(loginParams: loginCredsDto) {
        try {
            const user = await this.userRepository.findOne({ where: { email: loginParams.email } });
            const password = await bcrypt.hash(loginParams.password, user.salt || '');
            if (user && (password === user.password)) {
                if (user.token != "") {
                    return {
                        "Message": "User Already Logged In"
                    }
                }
                const payload = { sub: user.id, username: user.username, role: user.role };
                const token = await this.JwtService.signAsync(
                    payload,
                    {
                        secret: process.env.SECRET_KEY
                    }
                )
                user.token = token;
                await this.userRepository.save(user);
                return {
                    "USER": user.username,
                    "ROLE": user.role,
                    "TOKEN": token
                }
            }
            else {
                throw new HttpException(
                    'Wrong Credentials',
                    HttpStatus.UNAUTHORIZED
                )
            }
        }
        catch {
            throw new HttpException(
                'Wrong Credentials',
                HttpStatus.UNAUTHORIZED
            )
        }
    }

    async logout(user: any) {
        try {
            const userdb = await this.userRepository.findOne({ where: { username: user.username } });
            userdb.token = "";
            await this.userRepository.save(userdb);
            return { "Message": "User Logged Out Successfully" };
        }
        catch {
            throw new HttpException(
                'Something Went Wrong, Try Again Later',
                HttpStatus.NOT_ACCEPTABLE
            )
        }
    }
}