import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenController } from './authen/authen.controller';
import { AuthenService } from './authen/authen.service';
import { CommunityController } from './community/community.controller';
import { CommunityService } from './community/community.service';
import { JwtService } from './jwt/jwt.service';
import { ApiKeyMiddleware } from './middleware/api-key.middleware';
import { DatabaseModule } from './module/database.module';
import { PostController } from './post/post.controller';
import { PostService } from './post/post.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule],
  controllers: [
    AppController,
    AuthenController,
    UserController,
    PostController,
    CommunityController,
  ],
  providers: [
    AppService,
    AuthenService,
    JwtService,
    UserService,
    PostService,
    CommunityService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiKeyMiddleware).forRoutes('/auth/login');
  }
}
