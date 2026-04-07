import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';

/**
 * Bootstrap function to initialize and start the NestJS application.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security layering: Helmet helps secure the app by setting various HTTP headers
  app.use(helmet());
  
  // CORS: Allow communication with the Next.js frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Validation: Global configuration for class-validator based DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // Automatically strip properties that are not in the DTO
    forbidNonWhitelisted: false,
    transform: true,        // Automatically transform primitive types (e.g., string id to number if needed)
  }));

  // Global Pipeline: Standardized response interception and error filtering
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  // Documentation: Auto-generate Swagger UI for API exploration
  const config = new DocumentBuilder()
    .setTitle('Delraw Supplier Portal API')
    .setDescription('Backend API for supplier onboarding and product management')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Startup: Begin listening on the defined port
  const port = process.env.PORT || 5000;
  await app.listen(port);
  
  console.log(`🚀 Backend running on http://localhost:${port}`);
  console.log(`📖 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
