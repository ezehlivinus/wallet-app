import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters/error.filter';
import { setupSwagger } from './config/swagger.config';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true
  });
  const configService = app.get(ConfigService);

  app.use(helmet())

  app.setGlobalPrefix(configService.get('app.apiPrefix'), {
    exclude: ['/']
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalInterceptors(new TransformInterceptor());

  if (configService.get('app.envName') !== 'development') {
    app.enableShutdownHooks()
  }

  setupSwagger(app)

  await app.listen(configService.get('app.port'))

  console.info(`Application server listening on port ${configService.get('app.port')}`)
}
bootstrap();
