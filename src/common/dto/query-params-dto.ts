import { IsIn, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class QueryParamsDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsPositive()
  page_size?: string = '1';

  @IsOptional()
  @IsPositive()
  @Min(1)
  limit?: string = '20';

  @IsOptional()
  @IsString()
  sortby?: string = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortorder?: 'asc' | 'desc' = 'asc';
}
