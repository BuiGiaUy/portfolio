import { Controller, Get } from '@nestjs/common';

/**
 * Health Check Controller
 *
 * Simple endpoint to verify the application is running.
 */
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'NestJS Clean Architecture',
    };
  }
}
