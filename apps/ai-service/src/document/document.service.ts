import { PrismaService } from '@ai-platform/database';
import { LoggerService } from '@ai-platform/shared';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { readFile } from 'fs/promises';
import { extname } from 'path';
import { OllamaEmbeddingService } from '../embeddings/embeddings.service';

@Injectable()
export class DocumentService {
  private static readonly CHUNK_SIZE = 500;
  private static readonly CHUNK_OVERLAP = 50;

  constructor(
    private readonly embeddingsService: OllamaEmbeddingService,
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async uploadDocument(
    filePath: string,
    title: string,
  ): Promise<{ documentId: string; chunksCount: number }> {
    this.assertSupportedFile(filePath);

    this.logger.log(`Reading document: title="${title}"`, 'DocumentService');
    const text = await readFile(filePath, 'utf-8');
    const chunks = this.splitIntoChunks(text);
    this.logger.log(`Split into ${chunks.length} chunk(s), storing document`, 'DocumentService');

    const documentId = randomUUID();
    await this.prismaService.$executeRaw(
      Prisma.sql`
        INSERT INTO "documents" ("id", "title", "content", "file_path", "created_at", "updated_at")
        VALUES (${documentId}, ${title}, ${text}, ${filePath}, NOW(), NOW())
      `,
    );

    this.logger.log(`Document row inserted: id=${documentId}`, 'DocumentService');

    let chunkIndex = 0;
    for (const chunk of chunks) {
      chunkIndex += 1;
      this.logger.debug(`Embedding chunk ${chunkIndex}/${chunks.length}`, 'DocumentService');
      const embedding = await this.embeddingsService.generateEmbedding(chunk);

      await this.prismaService.$executeRaw(
        Prisma.sql`
          INSERT INTO "chunks" ("id", "content", "embedding", "document_id")
          VALUES (
            gen_random_uuid()::text,
            ${chunk},
            ${`[${embedding.join(',')}]`}::vector,
            ${documentId}
          )
        `,
      );
    }

    this.logger.log(
      `Document indexed: id=${documentId}, chunks=${chunks.length}`,
      'DocumentService',
    );
    return { documentId, chunksCount: chunks.length };
  }

  splitIntoChunks(text: string): string[] {
    const normalized = text.trim();
    if (!normalized) {
      return [];
    }

    const chunks: string[] = [];
    const textLength = normalized.length;
    let start = 0;

    while (start < textLength) {
      let end = Math.min(start + DocumentService.CHUNK_SIZE, textLength);

      if (end < textLength) {
        const lastWhitespaceIndex = normalized.lastIndexOf(' ', end);
        if (lastWhitespaceIndex > start) {
          end = lastWhitespaceIndex;
        }
      }

      const chunk = normalized.slice(start, end).trim();
      if (chunk) {
        chunks.push(chunk);
      }

      if (end >= textLength) {
        break;
      }

      start = this.calculateNextStart(normalized, end);
    }

    return chunks;
  }

  private calculateNextStart(text: string, end: number): number {
    const overlapStart = Math.max(0, end - DocumentService.CHUNK_OVERLAP);

    if (!/\S/.test(text.charAt(overlapStart))) {
      return overlapStart;
    }

    const nextWhitespace = text.indexOf(' ', overlapStart);
    if (nextWhitespace === -1 || nextWhitespace >= end) {
      return overlapStart;
    }

    return nextWhitespace + 1;
  }

  private assertSupportedFile(filePath: string): void {
    const extension = extname(filePath).toLowerCase();
    const supportedExtensions = new Set(['.txt', '.md']);

    if (!supportedExtensions.has(extension)) {
      throw new Error(`Unsupported file extension "${extension}". Supported: .txt, .md`);
    }
  }
}
