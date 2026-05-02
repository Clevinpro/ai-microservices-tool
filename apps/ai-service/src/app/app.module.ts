import { DatabaseModule } from '@ai-platform/database';
import { KafkaModule } from '@ai-platform/kafka';
import { LoggerModule } from '@ai-platform/shared';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    LoggerModule,
    KafkaModule.forRoot({
      clientId: process.env.KAFKA_CLIENT_ID ?? 'ai-service',
      brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
      groupId: process.env.KAFKA_GROUP_ID ?? 'ai-service',
    }),
    AiModule,
  ],
})
export class AppModule {}
