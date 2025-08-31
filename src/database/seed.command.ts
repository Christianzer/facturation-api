import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DatabaseSeeder } from './seeds/database.seeder';

async function bootstrap() {
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const seeder = app.get(DatabaseSeeder);
    
    await seeder.seed();
    
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

bootstrap();