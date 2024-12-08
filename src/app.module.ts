import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenController } from './authen/authen.controller';
import { AuthenService } from './authen/authen.service';
import { JwtService } from './jwt/jwt.service';
import { DatabaseModule } from './module/database.module';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule],
  controllers: [AppController, AuthenController],
  providers: [AppService, AuthenService, JwtService],
})
export class AppModule {}
