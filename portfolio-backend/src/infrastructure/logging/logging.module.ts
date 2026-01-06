import { Module, Global } from '@nestjs/common';
import { StructuredLogger } from './structured-logger.service';

/**
 * LOGGING MODULE
 *
 * Global module that provides structured logging across the app.
 * Marked as @Global so it's available everywhere without imports.
 */

@Global()
@Module({
  providers: [StructuredLogger],
  exports: [StructuredLogger],
})
export class LoggingModule {}
