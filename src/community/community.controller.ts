import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CommunityService } from './community.service';

@Controller('community')
export class CommunityController {
  private readonly logger = new Logger('CommunityController');

  constructor(private readonly communityService: CommunityService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  async getCommunities() {
    try {
      return await this.communityService.getCommunities();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException({ error: `${error}` });
    }
  }
}
