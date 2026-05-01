import { LoggerModule } from '@ai-platform/shared';
import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { HealthController } from '../health/health.controller';

@Module({
  imports: [LoggerModule, AuthModule, AiModule],
  controllers: [HealthController],
})
export class AppModule {}
