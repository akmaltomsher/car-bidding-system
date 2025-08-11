import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { isEmpty, size } from 'lodash';
import { Server, Socket } from 'socket.io';
import { AdminAuctionService } from 'src/modules/admin/admin-auctions/admin-auction.service';
import { RedisService } from 'src/redis/redis.service';

@WebSocketGateway({ cors: { origin: '*' }, path: '/auction' })
export class AuctionGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly cacheKey = 'auction-list';
  constructor(
    private readonly adminAuctionService: AdminAuctionService,
    private readonly redisService: RedisService
  ) { }

  async afterInit(server: Server) {
    console.log('WebSocket Gateway Initialized');
  }

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    let auctions = await this.redisService.get(this.cacheKey);
    if (isEmpty(auctions) || (!isEmpty(auctions) && size(auctions.data) === 0)) {
      const now = new Date();
      auctions = await this.adminAuctionService.findAll({
        page: 1,
        limit: 20,
        query: {
          startTime: { $lte: now },
          endTime: { $gte: now },
        },
        sort: {},
      });
      await this.redisService.set(this.cacheKey, auctions, 60);
    }
    client.emit('auction-list', auctions);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  async broadcastAuctionList() {
    let auctions = await this.redisService.get(this.cacheKey);
    if (!auctions) {
      const now = new Date();
      auctions = await this.adminAuctionService.findAll({
        page: 1,
        limit: 20,
        query: {
          startTime: { $lte: now },
          endTime: { $gte: now }
        },
        sort: {},
      });
      await this.redisService.set(this.cacheKey, auctions, 60);
    }

    this.server.emit('auction-list', auctions);
    console.log('Broadcasted auction-list to all clients');
  }
  @SubscribeMessage('joinAuction')
  handleJoinAuction(@MessageBody() auctionId: string, @ConnectedSocket() client: Socket) {
    client.join(auctionId);
    console.log(`Client ${client.id} joined auction room: ${auctionId}`);
    client.emit('joinedAuction', { auctionId, message: 'Joined auction room' });
  }

  emitAuctionStart(auctionId: string) {
    this.server.to(auctionId).emit('auction-start', {
      auctionId,
      startedAt: new Date().toISOString(),
      message: 'Auction started!',
    });
    console.log(`Emitted auction-start event for auction ${auctionId}`);
  }

  emitBidUpdate(auctionId: string, bid: number, bidderId: string) {
    this.server.to(auctionId).emit('bid-update', {
      auctionId,
      bid,
      bidderId,
      updatedAt: new Date().toISOString(),
    });
    console.log(`Emitted bid-update for auction ${auctionId} with bid ${bid}`);
  }

  emitAuctionEnd(auctionId: string, winnerId: string, winningBid: number) {
    this.server.to(auctionId).emit('auction-end', {
      auctionId,
      winnerId,
      winningBid,
      endedAt: new Date().toISOString(),
      message: 'Auction ended.',
    });
    console.log(`Emitted auction-end event for auction ${auctionId}`);
  }

  broadcastAuctionStartTime(auctionId: string, startTime: Date) {
    const currentTime = new Date().toISOString();
    this.server.to(auctionId).emit('auction-start-time', {
      auctionId,
      currentTime,
      auctionStartTime: startTime.toISOString(),
      message: `Auction ${auctionId} start time info`,
    });

    console.log(`Broadcasted auction-start-time to room ${auctionId}`, { currentTime, auctionStartTime: startTime.toISOString() });
  }


  broadcastAuctionInfo(auctionId: string, startTime: Date) {
    this.server.to(auctionId).emit('auction-info', {
      auctionId,
      startTime: startTime.toISOString(),
      message: 'Auction start time info',
    });
    console.log(`Broadcasted auction-info for auction ${auctionId} with startTime ${startTime}`);
  }

}
