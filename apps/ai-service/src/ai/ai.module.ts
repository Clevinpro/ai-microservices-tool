import { KAFKA_TOPICS, LoggerService } from '@ai-platform/shared';
import { KafkaConsumerService, KafkaProducerService } from '@ai-platform/kafka';
import { Module, OnModuleInit } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { reduce } from 'rxjs/operators';
import { AiService } from './ai.service';
import { OllamaEmbeddingService } from '../embeddings/embeddings.service';
import { SearchService } from '../search/search.service';
import { AiProviderFactory } from './providers/ai-provider.factory';
import { ClaudeProvider } from './providers/claude.provider';
import { OllamaProvider } from './providers/ollama.provider';

interface AiRequestPayload {
  userId: string;
  conversationId?: string;
  message: string;
}

@Module({
  providers: [
    AiService,
    SearchService,
    OllamaEmbeddingService,
    AiProviderFactory,
    ClaudeProvider,
    OllamaProvider,
  ],
  exports: [AiService],
})
export class AiModule implements OnModuleInit {
  constructor(
    private readonly aiService: AiService,
    private readonly kafkaConsumer: KafkaConsumerService,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.kafkaConsumer.subscribe<AiRequestPayload>(
      KAFKA_TOPICS.AI_REQUEST,
      async ({ value }) => {
        try {
          this.logger.log(
            `Kafka AI_REQUEST: userId=${value.userId}, conversationId=${value.conversationId}, messageLength=${value.message?.length ?? 0}`,
            'AiModule',
          );
          const result = await lastValueFrom(
            this.aiService.processMessage(value).pipe(reduce((acc, chunk) => acc + chunk, '')),
          );

          await this.kafkaProducer.publish(KAFKA_TOPICS.AI_RESPONSE, {
            topic: KAFKA_TOPICS.AI_RESPONSE,
            value: {
              userId: value.userId,
              conversationId: value.conversationId,
              result,
            },
          });
          this.logger.log(
            `Kafka AI_RESPONSE published: userId=${value.userId}, conversationId=${value.conversationId}, resultLength=${result.length}`,
            'AiModule',
          );
        } catch (error) {
          this.logger.error(
            error instanceof Error ? error.message : String(error),
            error instanceof Error ? error.stack : undefined,
            'AiModule',
          );
          // Do not rethrow: invalid or poison messages would otherwise fail eachMessage repeatedly.
        }
      },
    );
  }
}
