import { IsNotEmpty, IsOptional, MaxLength } from "class-validator";

export class searchDto {
    @IsNotEmpty()
    @MaxLength(20)
    username: string;
}