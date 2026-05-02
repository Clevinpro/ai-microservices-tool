import Anthropic from '@anthropic-ai/sdk';
import { AiChatMessage, IAIProvider } from '@ai-platform/shared';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class ClaudeProvider implements IAIProvider {
  private readonly anthropic: Anthropic;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('CLAUDE_API_KEY'),
    });
    this.model = this.configService.get<string>('CLAUDE_MODEL') ?? 'claude-3-5-sonnet-20241022';
  }

  chat(message: AiChatMessage): Observable<string> {
    return new Observable<string>((subscriber) => {
      const stream =
        typeof message === 'string'
          ? this.anthropic.messages.stream({
              model: this.model,
              max_tokens: 4096,
              messages: [{ role: 'user', content: message }],
            })
          : this.anthropic.messages.stream({
              model: this.model,
              max_tokens: 4096,
              system: message.system,
              messages: [{ role: 'user', content: message.user }],
            });

      stream.on('text', (text) => subscriber.next(text));
      stream.on('error', (error) => subscriber.error(error));
      stream.on('end', () => subscriber.complete());

      return () => stream.abort();
    });
  }
}
