import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import { DB } from 'kysely-codegen';
import { v7 } from 'uuid';
import {
  CreateCommentRequestDto,
  CreatePostRequestDto,
  ListPostsRequestDto,
  UpdateCommentRequestDto,
  UpdatePostRequestDto,
} from '../@types/post.dto';
import { databaseProvider } from '../module/database.module';

@Injectable()
export class PostService {
  private readonly logger = new Logger('PostService');

  constructor(@Inject(databaseProvider) private readonly db: Kysely<DB>) {}

  async listPosts(req: ListPostsRequestDto) {
    this.logger.log(`listPosts: ${JSON.stringify(req)}`);

    let query = this.db
      .selectFrom('post')
      .innerJoin('community', 'community.id', 'post.communityId')
      .innerJoin('user', 'authorId', 'user.id')
      .leftJoin('comment', 'comment.postId', 'post.id');

    if (req.communityId) {
      query = query.where('post.communityId', '=', req.communityId);
    }
    if (req.search) {
      query = query.where(
        sql<string>`lower(post.title)`,
        'like',
        `%${req.search.toLocaleLowerCase()}%`,
      );
    }

    const result = await query
      .groupBy(['post.id', 'community.id', 'user.id'])
      .select([
        'post.id as postId',
        'community.name as communityName',
        'community.id as communityId',
        'authorId',
        'user.username as authorName',
        'user.profileImageUrl as authorImageUrl',
        'post.title',
        'post.content',
        'post.createdAt',
        'post.updatedAt',
        sql<number>`COUNT(comment.id)`.as('commentCount'),
      ])
      .orderBy('createdAt desc')
      .execute();

    return result.map((data) => ({
      ...data,
      communityId: Number(data.communityId),
      commentCount: Number(data.commentCount),
    }));
  }

  async getPostDetail(postId: string, userId?: string) {
    this.logger.log(`getPostDetail: ${JSON.stringify({ postId, userId })}`);

    const post = await this.db
      .selectFrom('post')
      .innerJoin('community', 'community.id', 'post.communityId')
      .innerJoin('user', 'authorId', 'user.id')
      .where('post.id', '=', postId)
      .select([
        'post.id as postId',
        'communityId',
        'community.name as communityName',
        'authorId',
        'user.username as authorName',
        'user.profileImageUrl as authorImageUrl',
        'post.title',
        'post.content',
        'post.createdAt',
        'post.updatedAt',
      ])
      .executeTakeFirst();

    if (!post) {
      throw new NotFoundException();
    }

    const comments = await this.db
      .selectFrom('comment')
      .innerJoin('user', 'userId', 'user.id')
      .where('postId', '=', postId)
      .select([
        'comment.id as commentId',
        'comment.comment',
        'comment.userId',
        'user.username as username',
        'user.profileImageUrl as userImageUrl',
        'comment.createdAt',
        'comment.updatedAt',
      ])
      .orderBy('createdAt desc')
      .execute();

    return {
      post: {
        ...post,
        communityId: Number(post.communityId),
        editable: userId === post.authorId,
        deletable: userId === post.authorId,
        commentCount: comments?.length ?? 0,
      },
      comments: (comments ?? []).map((comment) => ({
        ...comment,
        editable: userId === comment.userId,
        deletable: userId === comment.userId,
      })),
    };
  }

  async createPost(req: CreatePostRequestDto, userId: string) {
    this.logger.log(`createPost: ${JSON.stringify({ ...req, userId })}`);

    const post = { authorId: userId, ...req, createdAt: new Date(), id: v7() };

    await this.db.insertInto('post').values(post).execute();

    return post.id;
  }

  async updatePost(postId: string, req: UpdatePostRequestDto, userId: string) {
    this.logger.log(
      `updatePost: ${JSON.stringify({ ...req, postId, userId })}`,
    );

    const result = await this.db
      .updateTable('post')
      .set({
        communityId: req.communityId,
        title: req.title,
        content: req.content,
      })
      .where('id', '=', postId)
      .where('authorId', '=', userId)
      .execute();

    if (!result || !result[0].numUpdatedRows) {
      this.logger.error('update post failed');
      throw Error('update post failed');
    }
  }

  async deletePost(postId: string, userId: string) {
    this.logger.log(`deletePost: ${JSON.stringify({ postId, userId })}`);

    await this.db.transaction().execute(async (tx) => {
      await tx.deleteFrom('comment').where('postId', '=', postId).execute();

      const result = await tx
        .deleteFrom('post')
        .where('id', '=', postId)
        .where('authorId', '=', userId)
        .execute();

      if (!result || !result[0].numDeletedRows) {
        this.logger.error('delete post failed');
        throw Error('delete post failed');
      }
    });
  }

  async createComment(
    postId: string,
    req: CreateCommentRequestDto,
    userId: string,
  ) {
    this.logger.log(
      `createComment: ${JSON.stringify({ ...req, postId, userId })}`,
    );

    const comment = {
      id: v7(),
      comment: req.comment,
      postId,
      userId,
      createdAt: new Date(),
    };

    await this.db.insertInto('comment').values(comment).execute();

    return comment.id;
  }

  async updateComment(
    commentId: string,
    req: UpdateCommentRequestDto,
    userId: string,
  ) {
    this.logger.log(
      `updateComment: ${JSON.stringify({ ...req, commentId, userId })}`,
    );

    const result = await this.db
      .updateTable('comment')
      .set({
        comment: req.comment,
      })
      .where('id', '=', commentId)
      .where('userId', '=', userId)
      .execute();

    if (!result || !result[0].numUpdatedRows) {
      this.logger.error('update comment failed');
      throw Error('update comment failed');
    }
  }

  async deleteComment(commentId: string, userId: string) {
    this.logger.log(`deleteComment: ${JSON.stringify({ commentId, userId })}`);

    const result = await this.db
      .deleteFrom('comment')
      .where('id', '=', commentId)
      .where('userId', '=', userId)
      .execute();

    if (!result || !result[0].numDeletedRows) {
      this.logger.error('delete comment failed');
      throw Error('delete comment failed');
    }
  }
}
