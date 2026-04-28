import { DynamicModule, Module } from '@nestjs/common';
import { IKafkaModuleConfig } from '@ai-platform/shared';
import { KAFKA_MODULE_CONFIG } from './kafka.constants';
import { KafkaProducerService } from './kafka-producer.service';
import { KafkaConsumerService } from './kafka-consumer.service';

@Module({})
export class KafkaModule {
  static forRoot(config: IKafkaModuleConfig): DynamicModule {
    return {
      module: KafkaModule,
      global: true,
      providers: [
        {
          provide: KAFKA_MODULE_CONFIG,
          useValue: config,
        },
        KafkaProducerService,
        KafkaConsumerService,
      ],
      exports: [KafkaProducerService, KafkaConsumerService],
    };
  }
}
