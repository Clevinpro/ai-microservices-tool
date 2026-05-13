import type { Observable } from 'rxjs';

export type MessageRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

/**
 * Message format for LLM providers:
 * - string — single user message (backward compat)
 * - { system, user } — system + user (backward compat)
 * - ChatMessage[] — full chat history with roles
 */
export type AiChatMessage = string | { system: string; user: string } | ChatMessage[];

export interface IAIProvider {
  chat(message: AiChatMessage): Observable<string>;
  getActiveModel?(): Promise<string>;
}

export interface IAIConfig {
  provider: 'claude' | 'ollama';
  claudeApiKey?: string;
  ollamaUrl?: string;
}
