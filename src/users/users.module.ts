import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { FriendRequest } from './entities/friend-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, FriendRequest]), JwtModule.register({
    secret: process.env.SECRET_KEY
  })],
  controllers: [UsersController],
  providers: [UsersService, JwtService]
})
export class UsersModule { }
