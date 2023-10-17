import { IsNotEmpty, MaxLength } from "class-validator";

export class UpdatePassDto {
    @IsNotEmpty()
    @MaxLength(100)
    oldPassword: string;

    @IsNotEmpty()
    @MaxLength(100)
    newPassword: string;
}