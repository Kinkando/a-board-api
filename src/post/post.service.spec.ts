import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { Kysely } from 'kysely';
import { databaseProvider } from '../module/database.module';
import { v7 } from 'uuid';
import { ConfigModule } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';

describe('PostService', () => {
  let service: PostService;
  let dbMock: jest.Mocked<
    Kysely<any> & {
      executeTakeFirst: jest.Mock;
      execute: jest.Mock;
    }
  >;

  beforeEach(async () => {
    dbMock = {
      selectFrom: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      updateTable: jest.fn().mockReturnThis(),
      deleteFrom: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      insertInto: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      executeTakeFirst: jest.fn(),
      execute: jest.fn(),
      transaction: jest.fn().mockReturnThis(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [PostService, { provide: databaseProvider, useValue: dbMock }],
    }).compile();

    service = module.get<PostService>(PostService);
  });

  it('create post success', async () => {
    const userId = v7();
    const post = {
      communityId: 1,
      title: 'title',
      content: 'content',
    };

    dbMock.execute.mockReturnThis();

    const postId = await service.createPost(post, userId);

    expect(postId).toBeDefined();

    expect(dbMock.insertInto).toHaveBeenCalledWith('post');
    expect(dbMock.execute).toHaveBeenCalled();
  });

  it('create post failed', async () => {
    const userId = v7();
    const post = {
      communityId: 1,
      title: 'title',
      content: 'content',
    };

    dbMock.execute.mockRejectedValue(new Error('database error'));

    expect(
      async () => await service.createPost(post, userId),
    ).rejects.toThrow();

    expect(dbMock.insertInto).toHaveBeenCalledWith('post');
    expect(dbMock.execute).toHaveBeenCalled();
  });

  it('list post success', async () => {
    const posts = [
      {
        authorId: v7(),
        content: 'post content',
        createdAt: new Date(),
        title: 'post title',
        updatedAt: null,
        postId: v7(),
        communityName: 'LifeStyle',
        communityId: '1',
        authorName: 'Kookkai',
        authorImageUrl: null,
        commentCount: 0,
      },
    ];
    dbMock.execute.mockResolvedValue(posts);

    const result = await service.listPosts({});

    expect(result).toBeDefined();
    expect(result.length).toBe(posts.length);

    expect(dbMock.selectFrom).toHaveBeenCalledWith('post');
    expect(dbMock.execute).toHaveBeenCalled();
  });

  it('list post success with empty data', async () => {
    dbMock.execute.mockResolvedValue([]);

    const result = await service.listPosts({
      communityId: '1',
      search: 'post',
    });

    expect(result).toBeDefined();
    expect(result.length).toBe(0);

    expect(dbMock.selectFrom).toHaveBeenCalledWith('post');
    expect(dbMock.execute).toHaveBeenCalled();
  });

  it('list post failed', async () => {
    dbMock.execute.mockRejectedValue(new Error('database error'));

    expect(async () => await service.listPosts({})).rejects.toThrow();

    expect(dbMock.selectFrom).toHaveBeenCalledWith('post');
    expect(dbMock.execute).toHaveBeenCalled();
  });

  it('get post detail success', async () => {
    const post = {
      authorId: v7(),
      communityId: '1',
      content: 'Post body',
      createdAt: new Date(),
      title: 'Post topic',
      updatedAt: new Date(),
      postId: v7(),
      communityName: 'LifeStyle',
      authorName: 'Kookkai',
      authorImageUrl: null,
    };
    const comments = [
      {
        comment: 'comment',
        createdAt: new Date(),
        updatedAt: null,
        userId: post.authorId,
        commentId: v7(),
        username: 'Kookkai',
        userImageUrl: null,
      },
    ];
    dbMock.executeTakeFirst.mockResolvedValue(post);
    dbMock.execute.mockResolvedValue(comments);

    const result = await service.getPostDetail(post.postId);

    expect(result).toBeDefined();
    expect(result.post).toBeDefined();
    expect(result.comments).toBeDefined();

    expect(dbMock.selectFrom).toHaveBeenCalledWith('post');
    expect(dbMock.executeTakeFirst).toHaveBeenCalled();

    expect(dbMock.selectFrom).toHaveBeenCalledWith('post');
    expect(dbMock.execute).toHaveBeenCalled();
  });

  it('get post detail success with no comment', async () => {
    const post = {
      authorId: v7(),
      communityId: '1',
      content: 'Post body',
      createdAt: new Date(),
      title: 'Post topic',
      updatedAt: new Date(),
      postId: v7(),
      communityName: 'LifeStyle',
      authorName: 'Kookkai',
      authorImageUrl: null,
    };
    dbMock.executeTakeFirst.mockResolvedValue(post);
    dbMock.execute.mockResolvedValue(null);

    const result = await service.getPostDetail(post.postId);

    expect(result).toBeDefined();
    expect(result.post).toBeDefined();
    expect(result.comments.length).toBe(0);

    expect(dbMock.selectFrom).toHaveBeenCalledWith('post');
    expect(dbMock.executeTakeFirst).toHaveBeenCalled();

    expect(dbMock.selectFrom).toHaveBeenCalledWith('post');
    expect(dbMock.execute).toHaveBeenCalled();
  });

  it('get post detail failed: transaction is not found', async () => {
    dbMock.executeTakeFirst.mockRejectedValue(new NotFoundException());

    expect(async () => await service.getPostDetail(v7())).rejects.toThrow(
      new NotFoundException(),
    );

    expect(dbMock.selectFrom).toHaveBeenCalledWith('post');
    expect(dbMock.executeTakeFirst).toHaveBeenCalled();
  });

  it('get post detail failed: database error on 1st query', async () => {
    dbMock.executeTakeFirst.mockRejectedValue(new Error('database error'));

    expect(async () => await service.getPostDetail(v7())).rejects.toThrow();

    expect(dbMock.selectFrom).toHaveBeenCalledWith('post');
    expect(dbMock.executeTakeFirst).toHaveBeenCalled();
  });

  it('get post detail failed: database error on 2nd query', async () => {
    const post = {
      authorId: v7(),
      communityId: '1',
      content: 'Post body',
      createdAt: new Date(),
      title: 'Post topic',
      updatedAt: new Date(),
      postId: v7(),
      communityName: 'LifeStyle',
      authorName: 'Kookkai',
      authorImageUrl: null,
    };
    dbMock.executeTakeFirst.mockResolvedValue(post);
    dbMock.execute.mockRejectedValue(new Error('database error'));

    expect(
      async () => await service.getPostDetail(post.postId),
    ).rejects.toThrow();

    expect(dbMock.selectFrom).toHaveBeenCalledWith('post');
    expect(dbMock.executeTakeFirst).toHaveBeenCalled();
  });

  it('update post success', async () => {
    const userId = v7();
    const postId = v7();
    const post = {
      communityId: 1,
      title: 'title',
      content: 'content',
    };

    dbMock.execute.mockResolvedValue([{ numUpdatedRows: 1 }]);

    await service.updatePost(postId, post, userId);

    expect(dbMock.updateTable).toHaveBeenCalledWith('post');
    expect(dbMock.execute).toHaveBeenCalled();
  });

  it('update post failed: transaction is not found', async () => {
    const userId = v7();
    const postId = v7();
    const post = {
      communityId: 1,
      title: 'title',
      content: 'content',
    };

    dbMock.execute.mockResolvedValue([{ numUpdatedRows: 0 }]);

    expect(
      async () => await service.updatePost(postId, post, userId),
    ).rejects.toThrow(new Error('update post failed'));

    expect(dbMock.updateTable).toHaveBeenCalledWith('post');
    expect(dbMock.execute).toHaveBeenCalled();
  });

  it('update post failed: database error', async () => {
    const userId = v7();
    const postId = v7();
    const post = {
      communityId: 1,
      title: 'title',
      content: 'content',
    };

    dbMock.execute.mockRejectedValue(new Error('database error'));

    expect(
      async () => await service.updatePost(postId, post, userId),
    ).rejects.toThrow();

    expect(dbMock.updateTable).toHaveBeenCalledWith('post');
    expect(dbMock.execute).toHaveBeenCalled();
  });

  it('delete post success', async () => {
    const userId = v7();
    const postId = v7();

    dbMock.transaction.mockReturnThis();
    dbMock.execute
      .mockResolvedValueOnce([{ numUpdatedRows: 0 }])
      .mockResolvedValueOnce([{ numUpdatedRows: 1 }]);

    await service.deletePost(postId, userId);

    expect(dbMock.transaction).toHaveBeenCalled();
    expect(dbMock.execute).toHaveBeenCalled();
  });

  it('delete post failed', async () => {
    const userId = v7();
    const postId = v7();

    const error = new Error('delete post failed');
    dbMock.execute.mockRejectedValue(error);

    expect(
      async () => await service.deletePost(postId, userId),
    ).rejects.toThrow(error);

    expect(dbMock.execute).toHaveBeenCalled();
  });
});
