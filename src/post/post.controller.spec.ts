import { INestApplication, NotFoundException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { v7 } from 'uuid';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { JwtService } from '../jwt/jwt.service';

describe('PostController', () => {
  let app: INestApplication;
  let postService: jest.Mocked<PostService>;
  let controller: PostController;

  beforeEach(async () => {
    postService = {
      listPosts: jest.fn(),
      getPostDetail: jest.fn(),
      createPost: jest.fn(),
      updatePost: jest.fn(),
      deletePost: jest.fn(),
      createComment: jest.fn(),
      updateComment: jest.fn(),
      deleteComment: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      controllers: [PostController],
      providers: [
        JwtService,
        {
          provide: PostService,
          useValue: postService,
        },
      ],
    }).compile();

    controller = module.get<PostController>(PostController);
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('list posts success', async () => {
    const posts = [
      {
        communityId: 1,
        commentCount: 10,
        authorId: v7(),
        content: 'Post content',
        createdAt: new Date(),
        title: 'Post title',
        updatedAt: null,
        postId: v7(),
        communityName: 'LifeStyle',
        authorName: 'Kookkai',
        authorImageUrl: null,
      },
    ];
    postService.listPosts.mockResolvedValue(posts);
    const response = await controller.listPosts({ yourPost: true });
    expect(response).toEqual(posts);
  });

  it('list posts failed', async () => {
    postService.listPosts.mockRejectedValue(new Error('list posts error'));
    expect(async () => await controller.listPosts({})).rejects.toThrow();
  });

  it('get post detail success', async () => {
    const post = {
      communityId: 1,
      editable: true,
      deletable: true,
      commentCount: 0,
      authorId: v7(),
      content: 'content',
      createdAt: new Date(),
      title: 'title',
      updatedAt: null,
      postId: v7(),
      communityName: 'LifeStyle',
      authorName: 'Kookkai',
      authorImageUrl: null,
    };
    postService.getPostDetail.mockResolvedValue({ post, comments: [] });
    const response = await controller.getPostDetail(post.postId, {
      userId: post.authorId,
    });
    expect(response).toEqual({ post, comments: [] });
  });

  it('get post detail failed: transaction is not found', async () => {
    postService.getPostDetail.mockRejectedValue(new NotFoundException());
    expect(
      async () => await controller.getPostDetail(v7(), null),
    ).rejects.toThrow();
  });

  it('get post detail failed: token is invalid', async () => {
    postService.getPostDetail.mockRejectedValue(new NotFoundException());
    expect(async () => await controller.getPostDetail(v7())).rejects.toThrow();
  });

  it('get post detail failed', async () => {
    postService.getPostDetail.mockRejectedValue(new Error('list posts error'));
    expect(
      async () => await controller.getPostDetail(v7(), null),
    ).rejects.toThrow();
  });

  it('create post success', async () => {
    const post = {
      communityId: 1,
      content: 'content',
      title: 'title',
    };
    postService.createPost.mockResolvedValue(v7());
    const { postId } = await controller.createPost({ userId: v7() }, post);
    expect(postId).toBeDefined();
  });

  it('create post failed', async () => {
    const post = {
      communityId: 1,
      content: 'content',
      title: 'title',
    };
    postService.createPost.mockRejectedValue(new Error('create post error'));
    expect(
      async () => await controller.createPost({ userId: v7() }, post),
    ).rejects.toThrow();
  });

  it('update post success', async () => {
    const postId = v7();
    const post = {
      communityId: 1,
      content: 'content',
      title: 'title',
    };
    postService.updatePost.mockReturnThis();
    await controller.updatePost(postId, { userId: v7() }, post);
  });

  it('update post failed', async () => {
    const postId = v7();
    const post = {
      communityId: 1,
      content: 'content',
      title: 'title',
    };
    postService.updatePost.mockRejectedValue(new Error('update post error'));
    expect(
      async () => await controller.updatePost(postId, { userId: v7() }, post),
    ).rejects.toThrow();
  });

  it('delete post success', async () => {
    const postId = v7();
    postService.deletePost.mockReturnThis();
    await controller.deletePost(postId, { userId: v7() });
  });

  it('delete post failed', async () => {
    const postId = v7();
    postService.deletePost.mockRejectedValue(new Error('delete post error'));
    expect(
      async () => await controller.deletePost(postId, { userId: v7() }),
    ).rejects.toThrow();
  });

  it('create comment success', async () => {
    const postId = v7();
    const userId = v7();
    const comment = 'comment';
    postService.createComment.mockResolvedValue(v7());
    const commentId = await controller.createComment(
      postId,
      { userId },
      { comment },
    );
    expect(commentId).toBeDefined();
  });

  it('create post failed', async () => {
    const postId = v7();
    const userId = v7();
    const comment = 'comment';
    postService.createComment.mockRejectedValue(
      new Error('create comment error'),
    );
    expect(
      async () =>
        await controller.createComment(postId, { userId }, { comment }),
    ).rejects.toThrow();
  });

  it('update comment success', async () => {
    const commentId = v7();
    const userId = v7();
    const comment = 'comment';
    postService.updateComment.mockReturnThis();
    await controller.updateComment(commentId, { userId }, { comment });
  });

  it('update post failed', async () => {
    const commentId = v7();
    const userId = v7();
    const comment = 'comment';
    postService.updateComment.mockRejectedValue(
      new Error('update comment error'),
    );
    expect(
      async () =>
        await controller.updateComment(commentId, { userId }, { comment }),
    ).rejects.toThrow();
  });

  it('delete comment success', async () => {
    const commentId = v7();
    const userId = v7();
    postService.deleteComment.mockReturnThis();
    await controller.deleteComment(commentId, { userId });
  });

  it('delete post failed', async () => {
    const commentId = v7();
    const userId = v7();
    postService.deleteComment.mockRejectedValue(
      new Error('delete comment error'),
    );
    expect(
      async () => await controller.deleteComment(commentId, { userId }),
    ).rejects.toThrow();
  });
});
