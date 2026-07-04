import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global API prefix
  app.setGlobalPrefix('apis');


  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'https://www.chronoca.com',
        'https://chronoca.com',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
      ];

  app.enableCors({
    origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, Postman, curl, same-origin)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Always allow the server's own origin so Swagger UI works
      const serverPort = process.env.PORT ?? '8001';
      const selfOrigins = [
        `http://localhost:${serverPort}`,
        `http://127.0.0.1:${serverPort}`,
      ];

      if (allowedOrigins.includes(origin) || selfOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`Blocked CORS request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies to be sent
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  });

  // 89
  // Validation pipe for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // strips unknown properties
      forbidNonWhitelisted: true, // throws error for extra props
      transform: true,           // auto-transform query params to DTO types
    }),
  );

  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  const port = process.env.PORT ?? 7000;
  await app.listen(port);
  
  console.log(`🚀 Server running on: http://localhost:${port}/apis`);
}

bootstrap();
