import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import {
  CreateCommentRequestDto,
  CreatePostRequestDto,
  ListPostsRequestDto,
  UpdateCommentRequestDto,
  UpdatePostRequestDto,
} from '../@types/post.dto';
import { Profile } from '../@types/user.interface';
import { ProfileDecorator } from '../decorator/profile.decorator';
import { AuthGuard } from '../guard/auth.guard';
import { ProfileInterceptor } from '../interceptor/profile.interceptor';

@Controller('post')
export class PostController {
  private readonly logger = new Logger('PostController');

  constructor(private readonly postService: PostService) {}

  @Get('')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ProfileInterceptor)
  async listPosts(
    @Query() req: ListPostsRequestDto,
    @ProfileDecorator() profile?: Profile,
  ) {
    try {
      if (req.yourPost === 'true') {
        req.authorId = profile?.userId;
      }
      return await this.postService.listPosts(req);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException({ error: `${error}` });
    }
  }

  @Get(':postId')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ProfileInterceptor)
  async getPostDetail(
    @Param('postId') postId: string,
    @ProfileDecorator() profile?: Profile,
  ) {
    try {
      return await this.postService.getPostDetail(postId, profile?.userId);
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException({ error: `${error}` });
      }
      throw new InternalServerErrorException({ error: `${error}` });
    }
  }

  @Post('')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async createPost(
    @ProfileDecorator() profile: Profile,
    @Body() req: CreatePostRequestDto,
  ) {
    try {
      const postId = await this.postService.createPost(req, profile.userId);
      return { postId };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException({ error: `${error}` });
    }
  }

  @Patch(':postId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('postId') postId: string,
    @ProfileDecorator() profile: Profile,
    @Body() req: UpdatePostRequestDto,
  ) {
    try {
      await this.postService.updatePost(postId, req, profile.userId);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException({ error: `${error}` });
    }
  }

  @Delete(':postId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('postId') postId: string,
    @ProfileDecorator() profile: Profile,
  ) {
    try {
      await this.postService.deletePost(postId, profile.userId);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException({ error: `${error}` });
    }
  }

  @Post(':postId/comment')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async createComment(
    @Param('postId') postId: string,
    @ProfileDecorator() profile: Profile,
    @Body() req: CreateCommentRequestDto,
  ) {
    try {
      const commentId = await this.postService.createComment(
        postId,
        req,
        profile.userId,
      );
      return { commentId };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException({ error: `${error}` });
    }
  }

  @Patch(':postId/comment/:commentId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Param('commentId') commentId: string,
    @ProfileDecorator() profile: Profile,
    @Body() req: UpdateCommentRequestDto,
  ) {
    try {
      await this.postService.updateComment(commentId, req, profile.userId);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException({ error: `${error}` });
    }
  }

  @Delete(':postId/comment/:commentId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('commentId') commentId: string,
    @ProfileDecorator() profile: Profile,
  ) {
    try {
      await this.postService.deleteComment(commentId, profile.userId);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException({ error: `${error}` });
    }
  }
}
