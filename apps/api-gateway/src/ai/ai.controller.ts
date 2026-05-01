import { Body, Controller, MessageEvent, Post, Req, Sse, UseGuards } from '@nestjs/common';
import { KafkaConsumerService, KafkaProducerService } from '@ai-platform/kafka';
import { LoggerService } from '@ai-platform/shared';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../auth/auth.guard';
import { ChatRequestDto } from './ai.dto';

const AI_REQUEST_TOPIC = 'AI_REQUEST';
const AI_RESPONSE_TOPIC = 'AI_RESPONSE';

type AuthenticatedRequest = {
  user: {
    id?: string;
    sub?: string;
    userId?: string;
  };
};

type AiResponsePayload = {
  userId: string;
  conversationId?: string;
  [key: string]: unknown;
};

@Controller('ai')
export class AiController {
  constructor(
    private readonly kafkaProducer: KafkaProducerService,
    private readonly kafkaConsumer: KafkaConsumerService,
    private readonly logger: LoggerService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('chat')
  async chat(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ChatRequestDto,
  ): Promise<{ status: 'processing'; conversationId?: string }> {
    const userId = this.getUserId(req);
    this.logger.log('AI chat request received', AiController.name, {
      userId,
      conversationId: dto.conversationId,
    });

    await this.kafkaProducer.publish(AI_REQUEST_TOPIC, {
      topic: AI_REQUEST_TOPIC,
      value: {
        userId,
        message: dto.message,
        conversationId: dto.conversationId,
      },
    });

    this.logger.log('AI chat request queued', AiController.name, {
      userId,
      conversationId: dto.conversationId,
    });

    return {
      status: 'processing',
      conversationId: dto.conversationId,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Sse('chat/stream')
  stream(@Req() req: AuthenticatedRequest): Observable<MessageEvent> {
    const userId = this.getUserId(req);
    this.logger.log('AI chat stream opened', AiController.name, { userId });

    return new Observable<MessageEvent>((subscriber) => {
      void this.kafkaConsumer.subscribe<AiResponsePayload>(AI_RESPONSE_TOPIC, async (message) => {
        if (message.value.userId !== userId) {
          return;
        }

        subscriber.next({
          data: message.value,
        });
      });
    });
  }

  private getUserId(req: AuthenticatedRequest): string {
    return req.user.id ?? req.user.sub ?? req.user.userId ?? '';
  }
}
