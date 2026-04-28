import { IKafkaMessage, IKafkaModuleConfig } from '@ai-platform/shared';
import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KAFKA_MODULE_CONFIG } from './kafka.constants';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private client!: ClientKafka;

  constructor(
    @Inject(KAFKA_MODULE_CONFIG)
    private readonly config: IKafkaModuleConfig,
  ) {}

  async onModuleInit(): Promise<void> {
    // TODO: create ClientKafka instance from this.config (clientId, brokers)
    // TODO: call this.client.connect()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async publish<T>(topic: string, message: IKafkaMessage<T>): Promise<void> {
    // TODO: this.client.emit(topic, message) — returns Observable, convert to Promise
  }

  async onModuleDestroy(): Promise<void> {
    // TODO: this.client.close()
  }
}
