import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module.js';

async function bootstrap() {
  try {
    console.log('Starting Nest application bootstrap...');
    const app = await NestFactory.create(AppModule);
    console.log('App created, getting port...');
    const port = process.env.PORT || 5000;
    console.log(`Success! App would listen on ${port}`);
    process.exit(0);
  } catch (err) {
    console.error('--- NEST BOOTSTRAP FAILED ---');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    if (err.stack) {
      console.error('Stack trace:', err.stack);
    }
    process.exit(1);
  }
}

bootstrap();
