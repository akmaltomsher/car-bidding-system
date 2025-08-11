// src/app.module.ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppService } from 'src/app.service';
import { AppController } from 'src/app.controller';
import { MongoModule } from 'src/shared/mongo.module';
import { DatabaseModule } from 'src/config/database.module';
import { BiddingModule } from 'src/modules/bidding.module';
import { DynamicGuard } from 'src/common/guards/dynamic.guard';
import { RoutingModule } from 'src/routes/routing-module';
import { SequenceModule } from 'src/modules/common/sequence/sequence-module';

import { PreflightMiddleware } from 'src/common/middlewares/preflight-middleware';
import { AuctionModule } from 'src/modules/auction/auction.module';
// import { ContentLengthMiddleware } from 'src/common/middlewares/content-length-middleware';

@Module({
  imports: [
    MongooseModule.forFeature([]),
    ConfigModule.forRoot({ envFilePath: './environments/.env', isGlobal: true }),
    DatabaseModule,
    MongoModule,
    RoutingModule,
    SequenceModule,
    BiddingModule,
    AuctionModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: DynamicGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PreflightMiddleware).forRoutes('*');
  }
}
