import { DatabaseModule } from '@ai-platform/database';
import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { OllamaEmbeddingService } from '../embeddings/embeddings.service';

@Module({
  imports: [DatabaseModule],
  controllers: [DocumentController],
  providers: [DocumentService, OllamaEmbeddingService],
})
export class DocumentModule {}
