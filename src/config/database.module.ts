import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        console.log('Connecting to MongoDB URI:', uri);
        return {
          uri,
          serverSelectionTimeoutMS: 20000,
          socketTimeoutMS: 45000,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {
  private readonly logger = new Logger(DatabaseModule.name);
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const mongoUri = this.configService.get<string>('MONGODB_URI');
    if (!mongoUri) {
      this.logger.error('MONGODB_URI is not set. Please check your environment configuration.');
    } else {
      this.logger.log(`Connecting to MongoDB with URI: ${mongoUri}`);
    }
  }
}
