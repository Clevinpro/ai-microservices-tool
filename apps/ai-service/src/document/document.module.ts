import { DatabaseModule } from '@ai-platform/database';
import { Module } from '@nestjs/common';
import { OllamaEmbeddingService } from '../embeddings/embeddings.service';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';

@Module({
  imports: [DatabaseModule, KnowledgeModule],
  controllers: [DocumentController],
  providers: [DocumentService, OllamaEmbeddingService],
})
export class DocumentModule {}
