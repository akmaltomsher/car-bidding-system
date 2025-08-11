import { Controller, Post, Body, Get, Param, Delete, Query } from '@nestjs/common';
import { AdminAuctionService } from 'src/modules/admin/admin-auctions/admin-auction.service';
import {
  CreateAuctionDto,
  StatusChangeAuctionDto,
  UpdateAuctionDto,
  updateAuctionSchema,
} from 'src/common/dto/admin/auction.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { isEmpty, parseInt } from 'lodash';
import { QueryParamsDto } from 'src/common/dto/query-params-dto';
import { AuctionService } from 'src/modules/auction/auction.service';
import { AuctionGateway } from 'src/modules/auction/auction.gateway';
import { RedisService } from 'src/redis/redis.service';

@Controller()
export class AdminAuctionController {
  constructor(
    private readonly adminAuctionService: AdminAuctionService,
    private readonly auctionService: AuctionService,
    private readonly auctionGateway: AuctionGateway,
    private readonly redisService: RedisService
  ) { }

  @Get()
  async findAll(@Query() queryParams: QueryParamsDto) {
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
          { startTime: keywordRegex },
          { endTime: keywordRegex },
        ],
        ...query
      } as any;
    }
    const auctions: any = await this.adminAuctionService.findAll({
      page: parseInt(page_size as string),
      limit: parseInt(limit as string),
      query,
      sort,
    });

    return auctions;
  }

  @Post()
  async create(@Body() createAuctionDto: any) {
    const retVal: any = await this.adminAuctionService.create({
      ...createAuctionDto,
    });
    if (!isEmpty(retVal)) {
      await this.redisService.del('auction-list');
      this.auctionGateway.broadcastAuctionInfo(retVal._id, new Date(retVal.startTime));
      this.auctionService.scheduleAuctionStart(retVal._id, new Date(retVal.startTime));
      await this.auctionGateway.broadcastAuctionList();
    }

    return retVal;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.adminAuctionService.findOne(id);
  }

  @Post(':id')
  async update(@Param('id') id: string,
    @Body(new ZodValidationPipe(updateAuctionSchema)) updateAuctionDto: UpdateAuctionDto) {
    const retVal: any = this.adminAuctionService.update(id, updateAuctionDto);
    if (!isEmpty(retVal)) {
      this.auctionService.scheduleAuctionStart(retVal._id, new Date(retVal.startTime));
    }

    return retVal;
  }

  @Post('status-change/:id')
  async statusChange(@Param('id') id: string, @Body() statusChangeAuctionDto: StatusChangeAuctionDto) {
    const { status } = statusChangeAuctionDto;
    return this.adminAuctionService.update(id, { status });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.adminAuctionService.remove(id);
  }
}
