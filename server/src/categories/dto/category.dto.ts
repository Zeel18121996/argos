import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator'

export class CreateCategoryDto {
  @IsString()
  slug!: string

  @IsString()
  name!: string

  @IsOptional()
  @IsUUID()
  parentId?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number

  @IsOptional()
  @IsString()
  imageUrl?: string
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  slug?: string

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsUUID()
  parentId?: string | null

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number

  @IsOptional()
  @IsString()
  imageUrl?: string | null

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
