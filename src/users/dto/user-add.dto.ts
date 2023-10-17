import { IsEmail, IsNotEmpty, MaxLength, Min, MinLength } from 'class-validator';

export class UserAddDto {
    @IsNotEmpty()
    @MaxLength(20)
    username: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MinLength(8)
    password: string;
}