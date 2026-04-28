import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  // IKafkaMessage,
  IKafkaModuleConfig,
  KafkaMessageHandler,
} from '@ai-platform/shared';
import { KAFKA_MODULE_CONFIG } from './kafka.constants';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(KAFKA_MODULE_CONFIG)
    private readonly config: IKafkaModuleConfig,
  ) {}

  async onModuleInit(): Promise<void> {
    // TODO: create KafkaJS consumer using this.config (clientId, brokers, groupId)
    // TODO: call consumer.connect()
  }

  async subscribe<T>(topic: string, handler: KafkaMessageHandler<T>): Promise<void> {
    // TODO: consumer.subscribe({ topic, fromBeginning: false })
    // TODO: consumer.run({ eachMessage: async ({ message }) => {
    //   const parsed: IKafkaMessage<T> = { topic, value: JSON.parse(message.value?.toString() ?? ''), key: message.key?.toString() };
    //   await handler(parsed);
    // }})
    void topic;
    void handler;
  }

  async onModuleDestroy(): Promise<void> {
    // TODO: consumer.disconnect()
  }
}
