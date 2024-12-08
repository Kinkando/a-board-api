import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenService } from './authen.service';
import { LoginRequestDto, RefreshTokenRequestDto } from '../@types/authen.dto';

@Controller('auth')
export class AuthenController {
  private readonly logger = new Logger('AuthenController');

  constructor(private readonly authenService: AuthenService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginRequestDto) {
    try {
      return await this.authenService.login(body.username);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  @Post('token/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: RefreshTokenRequestDto) {
    try {
      return await this.authenService.refreshToken(body.refreshToken);
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException(error);
    }
  }
}
