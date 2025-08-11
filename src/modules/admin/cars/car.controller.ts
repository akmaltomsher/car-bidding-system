import { Controller, Post, Body, Get, Param, Patch, Delete, Request, Query } from '@nestjs/common';
import { CarService } from 'src/modules/admin/cars/car.service';
import { CreateCarDto, StatusChangeCarDto, UpdateCarDto, updateCarSchema } from 'src/common/dto/admin/car.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { SkipAuth } from 'src/modules/auth/skip-auth.decorator';
import { QueryParamsDto } from 'src/common/dto/query-params-dto';

@Controller()
export class CarController {
  constructor(private readonly carService: CarService) { }

  @Get()
  async findAll(@Query() queryParams: QueryParamsDto, @Request() req: any) {
    const { page_size, limit, sortby, sortorder, keyword } = queryParams
    let query: any = { _id: { $exists: true } };

    const sort: any = {};
    if (sortby && sortorder) {
      sort[sortby] = sortorder === 'desc' ? -1 : 1;
    }

    if (keyword) {
      const keywordRegex = new RegExp(keyword, 'i');
      query = {
        $or: [
          { vin: keywordRegex },
          { make: keywordRegex },
          { model: keywordRegex },
          { year: keywordRegex },
        ],
        ...query
      } as any;
    }
    const userTypes: any = await this.carService.findAll({
      page: parseInt(page_size as string),
      limit: parseInt(limit as string),
      query,
      sort,
    });

    return userTypes;
  }

  @Post()
  @SkipAuth()
  async create(@Body() createCarDto: CreateCarDto) {
    return this.carService.create({
      ...createCarDto,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.carService.findOne(id);
  }

  @Post(':id')
  async update(@Param('id') id: string, @Body(new ZodValidationPipe(updateCarSchema)) updateCarDto: UpdateCarDto) {
    return this.carService.update(id, updateCarDto);
  }

  @Post('status-change/:id')
  async statusChange(@Param('id') id: string, @Body() statusChangeCarDto: StatusChangeCarDto) {
    const { status } = statusChangeCarDto;
    return this.carService.update(id, { status });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.carService.remove(id);
  }
}
