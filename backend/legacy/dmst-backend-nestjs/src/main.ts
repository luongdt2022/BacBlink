import 'iconv-lite';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggerService } from './shared/logger/logger.service';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(LoggerService));

  const trustProxy = process.env.TRUST_PROXY;
  if (trustProxy === undefined || trustProxy === 'true') {
    app.set('trust proxy', 1);
  } else if (trustProxy === 'false') {
    app.set('trust proxy', false);
  } else if (/^\d+$/.test(trustProxy)) {
    app.set('trust proxy', Number(trustProxy));
  } else {
    app.set('trust proxy', trustProxy);
  }

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  const corsOrigin =
    process.env.CORS_ORIGIN ?? 'http://localhost:5173,http://localhost:5174';
  app.enableCors({
    origin: corsOrigin
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    credentials: true,
  });

  app.setGlobalPrefix(`${process.env.API_PREFIX}/${process.env.API_VERSION}`);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  if (process.env.ENABLE_DOCUMENTATION === 'true') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('DMST POC API')
      .setDescription('API documentation for DMST POC backend')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = process.env.PORT ?? 3013;
  await app.listen(port);
}

void bootstrap();
