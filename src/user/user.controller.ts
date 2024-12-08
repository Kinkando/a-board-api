import {
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  UseGuards,
  HttpCode,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Profile } from '../@types/user.interface';
import { ProfileDecorator } from '../decorator/profile.decorator';
import { AuthGuard } from '../guard/auth.guard';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  private readonly logger = new Logger('UserController');

  constructor(private readonly userService: UserService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  async getUser(@ProfileDecorator() profile: Profile) {
    try {
      return await this.userService.getUser(profile.userId);
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException({ error: `${error}` });
      }
      throw new InternalServerErrorException({ error: `${error}` });
    }
  }
}
