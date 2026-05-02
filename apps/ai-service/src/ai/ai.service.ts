import { LoggerService } from '@ai-platform/shared';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { SearchService } from '../search/search.service';
import { AiProviderFactory } from './providers/ai-provider.factory';

type AiRequestPayload = {
  message: string;
};

@Injectable()
export class AiService {
  constructor(
    private readonly searchService: SearchService,
    private readonly factory: AiProviderFactory,
    private readonly logger: LoggerService,
  ) {}

  processMessage(request: unknown): Observable<string> {
    const payload = this.parseRequest(request);
    this.logger.log(`Process message: length=${payload.message.length}`, 'AiService');
    const provider = this.factory.getProvider();

    return from(this.searchService.similaritySearch(payload.message)).pipe(
      tap((chunks) => this.logger.log(`Context chunks: count=${chunks.length}`, 'AiService')),
      switchMap((chunks) => {
        const messageWithContext =
          chunks.length > 0
            ? {
                system: `Відповідай на основі контексту:
${this.searchService.formatContext(chunks)}
Якщо відповіді немає в контексті — скажи про це.`,
                user: payload.message,
              }
            : payload.message;

        this.logger.log('Starting LLM stream', 'AiService');
        return provider.chat(messageWithContext).pipe(
          tap({
            complete: () => this.logger.log('LLM stream completed', 'AiService'),
            error: (err: unknown) =>
              this.logger.error(
                err instanceof Error ? err.message : String(err),
                err instanceof Error ? err.stack : undefined,
                'AiService',
              ),
          }),
        );
      }),
    );
  }

  private parseRequest(request: unknown): AiRequestPayload {
    if (!request || typeof request !== 'object') {
      this.logger.warn('Invalid AI request: not an object', 'AiService');
      throw new BadRequestException('Request must be an object.');
    }

    const r = request as Record<string, unknown>;
    const raw =
      typeof r.message === 'string' ? r.message : typeof r.text === 'string' ? r.text : undefined;
    const message = typeof raw === 'string' ? raw.trim() : '';

    if (!message) {
      this.logger.warn('Invalid AI request: missing, empty, or non-string message', 'AiService');
      throw new BadRequestException('Request message must be a non-empty string.');
    }

    return { message };
  }
}
