import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const clientOrigin =
    process.env.CLIENT_URL ?? 'http://localhost:3001';
  app.enableCors({
    origin: clientOrigin,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    skipMissingProperties: true,
    transform: true,
  }));

  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useGlobalFilters(new HttpExceptionFilter());

  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
