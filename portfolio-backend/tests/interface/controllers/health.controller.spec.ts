import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from 'src/interface/controllers/health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health status with ok status', () => {
      const result = controller.check();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('service', 'NestJS Clean Architecture');
    });

    it('should return health status with timestamp', () => {
      const result = controller.check();

      expect(result).toHaveProperty('timestamp');
      expect(typeof result.timestamp).toBe('string');
      expect(new Date(result.timestamp).toString()).not.toBe('Invalid Date');
    });

    it('should return current timestamp', () => {
      const beforeCall = new Date();
      const result = controller.check();
      const afterCall = new Date();

      const timestamp = new Date(result.timestamp);
      expect(timestamp.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(timestamp.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });
  });
});
