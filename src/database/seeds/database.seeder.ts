import { Injectable } from '@nestjs/common';
import { UserSeeder } from './user.seeder';
import { CustomerSeeder } from './customer.seeder';
import { ProductSeeder } from './product.seeder';

@Injectable()
export class DatabaseSeeder {
  constructor(
    private userSeeder: UserSeeder,
    private customerSeeder: CustomerSeeder,
    private productSeeder: ProductSeeder,
  ) {}

  async seed(): Promise<void> {
    console.log('🌱 Starting database seeding...');
    
    try {
      console.log('\n👥 Seeding users...');
      await this.userSeeder.seed();
      
      console.log('\n🏢 Seeding customers...');
      await this.customerSeeder.seed();
      
      console.log('\n📦 Seeding products...');
      await this.productSeeder.seed();
      
      console.log('\n✅ Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Error during database seeding:', error);
      throw error;
    }
  }
}