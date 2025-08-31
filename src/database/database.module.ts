import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Customer } from '../entities/customer.entity';
import { Product } from '../entities/product.entity';
import { UserSeeder } from './seeds/user.seeder';
import { CustomerSeeder } from './seeds/customer.seeder';
import { ProductSeeder } from './seeds/product.seeder';
import { DatabaseSeeder } from './seeds/database.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Customer, Product]),
  ],
  providers: [
    UserSeeder,
    CustomerSeeder,
    ProductSeeder,
    DatabaseSeeder,
  ],
  exports: [DatabaseSeeder],
})
export class DatabaseModule {}