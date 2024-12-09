import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      skipMissingProperties: true,
      exceptionFactory: (errors: ValidationError[]) => {
        return new BadRequestException({
          error: errors.map((err) => {
            delete err.target;
            delete err.children;
            return err;
          }),
        });
      },
    }),
  );
  app.enableCors({
    origin: true,
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
