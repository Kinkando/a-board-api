import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ListPostsRequestDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  communityId?: string;
}

export class CreatePostRequestDto {
  @IsNotEmpty({ message: 'communityId is required' })
  @IsNumber()
  communityId: number;

  @IsNotEmpty({ message: 'title is required' })
  @IsString()
  title: string;

  @IsNotEmpty({ message: 'content is required' })
  @IsString()
  content: string;
}

export class UpdatePostRequestDto {
  @IsNotEmpty({ message: 'communityId is required' })
  @IsNumber()
  communityId: number;

  @IsNotEmpty({ message: 'title is required' })
  @IsString()
  title: string;

  @IsNotEmpty({ message: 'content is required' })
  @IsString()
  content: string;
}

export class CreateCommentRequestDto {
  @IsNotEmpty({ message: 'comment is required' })
  @IsString()
  comment: string;
}

export class UpdateCommentRequestDto {
  @IsNotEmpty({ message: 'comment is required' })
  @IsString()
  comment: string;
}
