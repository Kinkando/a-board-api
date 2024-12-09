import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  HttpStatus,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import * as request from 'supertest';
import { v7 } from 'uuid';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;
  let userId: string;
  const username: string = 'test';
  let postId: string;
  let commentId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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
    await app.init();

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-Api-Key', process.env.API_KEY)
      .send({ username });

    accessToken = loginResponse.body.accessToken;
    refreshToken = loginResponse.body.refreshToken;

    const userResponse = await request(app.getHttpServer())
      .get('/user')
      .set('Authorization', `Bearer ${accessToken}`);

    userId = userResponse.body.id;
  });

  afterAll((done) => {
    app.close();
    done();
  });

  it('login success', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .set('X-Api-Key', process.env.API_KEY)
      .send({ username })
      .expect(HttpStatus.OK);
  });

  it('login failed: invalid api key', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .set('X-Api-Key', 'invalid')
      .send({ username })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('login failed: missing api key', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ username })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('refresh token success', async () => {
    return request(app.getHttpServer())
      .post('/auth/token/refresh')
      .send({ refreshToken })
      .expect(HttpStatus.OK);
  });

  it('refresh token failed', async () => {
    return request(app.getHttpServer())
      .post('/auth/token/refresh')
      .send({ refreshToken: 'invalid' })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('get communities success', async () => {
    return request(app.getHttpServer())
      .get('/community')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);
  });

  it('get user success', async () => {
    return request(app.getHttpServer())
      .get('/user')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK)
      .expect({ id: userId, username, profileImageUrl: null });
  });

  it('get user failed', async () => {
    return request(app.getHttpServer())
      .get('/user')
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('create post success', async () => {
    const response = await request(app.getHttpServer())
      .post('/post')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        communityId: 1,
        title: 'Post1',
        content: 'Detail1',
      })
      .expect(HttpStatus.OK);

    postId = response.body.postId;
  });

  it('create post failed: unauthorized', async () => {
    return await request(app.getHttpServer())
      .post('/post')
      .send({
        communityId: 1,
        title: 'Post1',
        content: 'Detail1',
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('create post failed: bad request', async () => {
    const response = await request(app.getHttpServer())
      .post('/post')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        communityId: 'invalid',
        title: 2,
        content: true,
      })
      .expect(HttpStatus.BAD_REQUEST);
    console.log(response.body);
  });

  it('list posts success', async () => {
    return await request(app.getHttpServer())
      .get(`/post`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);
  });

  it('list posts success without login', async () => {
    return await request(app.getHttpServer())
      .get(`/post`)
      .expect(HttpStatus.OK);
  });

  it('update post success', async () => {
    return await request(app.getHttpServer())
      .patch(`/post/${postId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        communityId: 1,
        title: 'Post1-edited',
        content: 'Detail1-edited',
      })
      .expect(HttpStatus.NO_CONTENT);
  });

  it('update post failed: unauthorized', async () => {
    return await request(app.getHttpServer())
      .patch(`/post/${postId}`)
      .send({
        communityId: 1,
        title: 'Post1-edited',
        content: 'Detail1-edited',
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('update post failed: post id is not found', async () => {
    return await request(app.getHttpServer())
      .patch(`/post/${v7()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        communityId: 1,
        title: 'Post1-edited',
        content: 'Detail1-edited',
      })
      .expect(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('create comment success', async () => {
    const response = await request(app.getHttpServer())
      .post(`/post/${postId}/comment`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        comment: 'Comment',
      })
      .expect(HttpStatus.OK);

    commentId = response.body.commentId;
  });

  it('create comment failed: unauthorized', async () => {
    return await request(app.getHttpServer())
      .post(`/post/${postId}/comment`)
      .send({
        comment: 'Comment',
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('create comment failed: bad request', async () => {
    return await request(app.getHttpServer())
      .post(`/post/${postId}/comment`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        comment: 1,
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('update comment success', async () => {
    return await request(app.getHttpServer())
      .patch(`/post/${postId}/comment/${commentId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        comment: 'Comment-edited',
      })
      .expect(HttpStatus.NO_CONTENT);
  });

  it('update comment failed: unauthorized', async () => {
    return await request(app.getHttpServer())
      .patch(`/post/${postId}/comment/${commentId}`)
      .send({
        comment: 'Comment-edited',
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('update comment failed: bad request', async () => {
    return await request(app.getHttpServer())
      .patch(`/post/${postId}/comment/${commentId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        comment: 123,
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('get post detail success', async () => {
    return await request(app.getHttpServer())
      .get(`/post/${postId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);
  });

  it('get post detail success without login', async () => {
    return await request(app.getHttpServer())
      .get(`/post/${postId}`)
      .expect(HttpStatus.OK);
  });

  it('delete comment success', async () => {
    return await request(app.getHttpServer())
      .delete(`/post/${postId}/comment/${commentId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.NO_CONTENT);
  });

  it('delete comment failed: unauthorized', async () => {
    return await request(app.getHttpServer())
      .delete(`/post/${postId}/comment/${commentId}`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('delete comment failed: comment id is not found', async () => {
    return await request(app.getHttpServer())
      .delete(`/post/${postId}/comment/${v7()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('delete post success', async () => {
    return await request(app.getHttpServer())
      .delete(`/post/${postId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.NO_CONTENT);
  });

  it('delete post failed: unauthorized', async () => {
    return await request(app.getHttpServer())
      .delete(`/post/${postId}`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('delete post failed: post id is not found', async () => {
    return await request(app.getHttpServer())
      .delete(`/post/${v7()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
