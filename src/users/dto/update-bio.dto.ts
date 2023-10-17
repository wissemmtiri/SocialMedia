import { IsNotEmpty, Max, MaxLength } from "class-validator";

export class UpdateBioDto {
    @IsNotEmpty()
    @MaxLength(100)
    bio: string;
}