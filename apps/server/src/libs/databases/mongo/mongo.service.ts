import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class MongoService implements OnModuleInit {
  private readonly logger = new Logger(MongoService.name);
  
  constructor(@InjectConnection() private connection: Connection) { }

  onModuleInit() {
    this.connection.on('connected', () => {
      this.logger.log('MongoDB connected successfully');
    });

    this.connection.on('error', (error) => {
      this.logger.log('MongoDB connection error:', error);
    });

    this.connection.on('disconnected', () => {
      this.logger.warn('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await this.connection.close();
      this.logger.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  }
}
