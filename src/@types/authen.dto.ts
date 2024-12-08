import { IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestDto {
  @IsNotEmpty({ message: 'username is required' })
  @IsString()
  username: string;
}

export class RefreshTokenRequestDto {
  @IsNotEmpty({ message: 'refreshToken is required' })
  @IsString()
  refreshToken: string;
}
