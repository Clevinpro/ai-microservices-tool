import type { Observable } from 'rxjs';

/** Рядок — одне user-повідомлення; об'єкт — system + user (RAG-контекст). */
export type AiChatMessage =
  | string
  | {
      system: string;
      user: string;
    };

export interface IAIProvider {
  chat(message: AiChatMessage): Observable<string>;
  getActiveModel?(): Promise<string>;
}

export interface IAIConfig {
  provider: 'claude' | 'ollama';
  claudeApiKey?: string;
  ollamaUrl?: string;
}
