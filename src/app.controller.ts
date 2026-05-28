import { Controller, Get } from '@nestjs/common';

type HealthResponse = {
  name: string;
  version: string;
  devTeam: string;
  statusCode: number;
  timestamp: string;
  uptime: number;
};

@Controller()
export class AppController {
  @Get('health')
  health(): HealthResponse {
    return {
      name: 'Edu Platform',
      version: '1.0.0',
      devTeam: 'Fpoly HCM',
      statusCode: 200,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
