import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator'

export class TrevorHistoryItemDto {
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant'

  @IsString()
  @MaxLength(2000)
  text: string
}

export class TrevorChatDto {
  /** Stable per-session UUID generated client-side. */
  @IsUUID('4')
  sessionId: string

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  message: string

  /** Sliding window of the last few messages — server is otherwise stateless. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => TrevorHistoryItemDto)
  history?: TrevorHistoryItemDto[]
}

export interface TrevorReply {
  reply: string
  productSlugs: string[]
}
