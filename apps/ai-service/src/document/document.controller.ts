import { LoggerService } from '@ai-platform/shared';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { extname, join } from 'path';
import { DocumentService } from './document.service';

type UploadDocumentBody = {
  title?: string;
};

@Controller('documents')
export class DocumentController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly logger: LoggerService,
  ) {}

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: UploadDocumentBody,
  ): Promise<{ documentId: string; chunksCount: number }> {
    if (!file) {
      this.logger.warn('Upload rejected: file missing', 'DocumentController');
      throw new BadRequestException('File is required');
    }

    const extension = extname(file.originalname).toLowerCase();
    if (extension !== '.txt' && extension !== '.md') {
      this.logger.warn(`Upload rejected: unsupported extension ${extension}`, 'DocumentController');
      throw new BadRequestException('Only .txt and .md files are supported');
    }

    const tempDirectory = await mkdtemp(join(tmpdir(), 'ai-document-'));
    const tempFilePath = join(tempDirectory, `upload${extension}`);

    try {
      await writeFile(tempFilePath, file.buffer);
      const title = body.title?.trim() || file.originalname;
      this.logger.log(
        `Upload started: file="${file.originalname}", title="${title}"`,
        'DocumentController',
      );
      const result = await this.documentService.uploadDocument(tempFilePath, title);
      this.logger.log(
        `Upload finished: documentId=${result.documentId}, chunks=${result.chunksCount}`,
        'DocumentController',
      );
      return result;
    } finally {
      await rm(tempDirectory, { recursive: true, force: true });
    }
  }
}
