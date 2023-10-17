import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserAddDto } from './dto/user-add.dto';
import { loginCredsDto } from './dto/user-login.dto';
import { user } from 'src/decorators/user.decorator';
import { UsersGuard } from './users.guard';
import { UpdateBioDto } from './dto/update-bio.dto';
import { UpdatePassDto } from './dto/update-pass.dto';
import { searchDto } from './dto/search.dto';

@Controller()
export class UsersController {
    constructor(
        private userService: UsersService
    ) { }

    @Post('signUp')
    async signup(
        @Body() signupCreds: UserAddDto
    ) {
        return await this.userService.signup(signupCreds);
    }

    @Post('login')
    async login(
        @Body() loginParams: loginCredsDto
    ) {
        return await this.userService.login(loginParams);
    }

    @UseGuards(UsersGuard)
    @Get('logout')
    async logout(
        @user() user: any
    ) {
        return await this.userService.logout(user);
    }

    @UseGuards(UsersGuard)
    @Get('profile')
    async getProfile(
        @user() user: any
    ) {
        return await this.userService.getProfile(user);
    }

    @UseGuards(UsersGuard)
    @Get('friends')
    async getFriends(
        @user() user: any
    ) {
        return await this.userService.getFriends(user);
    }

    @UseGuards(UsersGuard)
    @Get('requests')
    async getRequests(
        @user() user: any
    ) {
        return await this.userService.getRequests(user);
    }

    @UseGuards(UsersGuard)
    @Get('sentRequests')
    async getSentRequests(
        @user() user: any
    ) {
        return await this.userService.getSentRequests(user);
    }

    @UseGuards(UsersGuard)
    @Post('sendRequest')
    async sendFriendRequest(
        @user() user: any,
        @Body() username: string
    ) {
        return await this.userService.sendRequest(user, username);
    }

    @UseGuards(UsersGuard)
    @Post('acceptRequest')
    async acceptRequest(
        @user() user: any,
        @Body() id: number
    ) {
        return await this.userService.acceptRequest(user, id);
    }

    @UseGuards(UsersGuard)
    @Post('rejectRequest')
    async rejectRequest(
        @user() user: any,
        @Body() id: number
    ) {
        return await this.userService.rejectRequest(user, id);
    }

    @UseGuards(UsersGuard)
    @Post('update/bio')
    async updateBio(
        @user() user: any,
        @Body() bio: UpdateBioDto
    ) {
        return await this.userService.updateBio(user, bio);
    }

    @UseGuards(UsersGuard)
    @Post('update/password')
    async updatePassword(
        @user() user: any,
        @Body() passwords: UpdatePassDto
    ) {
        return await this.userService.updatePassword(user, passwords);
    }

    @Get('search')
    async search(
        @Body() searchParams: searchDto
    ) {
        return await this.userService.search(searchParams);
    }

    @Get('discover')
    async discover() {
        return await this.userService.discover();
    }

    @UseGuards(UsersGuard)
    @Get('sendRequest')
    async sendRequest(
        @user() user: any,
        @Body() username: string
    ) {
        return await this.userService.sendRequest(user, username);
    }
}
