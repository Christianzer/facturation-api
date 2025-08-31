import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';

@Injectable()
export class UserSeeder {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async seed(): Promise<void> {
    const users = [
      {
        email: 'admin@facturation.ci',
        firstName: 'Admin',
        lastName: 'System',
        password: await bcrypt.hash('admin123', 12),
        isActive: true,
      },
      {
        email: 'kouame.yao@entreprise.ci',
        firstName: 'Kouamé',
        lastName: 'Yao',
        password: await bcrypt.hash('password123', 12),
        isActive: true,
      },
      {
        email: 'adjoua.koffi@business.ci',
        firstName: 'Adjoua',
        lastName: 'Koffi',
        password: await bcrypt.hash('password123', 12),
        isActive: true,
      },
      {
        email: 'mamadou.traore@company.ci',
        firstName: 'Mamadou',
        lastName: 'Traoré',
        password: await bcrypt.hash('password123', 12),
        isActive: true,
      },
      {
        email: 'akissi.brou@consulting.ci',
        firstName: 'Akissi',
        lastName: 'Brou',
        password: await bcrypt.hash('password123', 12),
        isActive: true,
      },
    ];

    for (const userData of users) {
      const existingUser = await this.userRepository.findOne({
        where: { email: userData.email },
      });

      if (!existingUser) {
        const user = this.userRepository.create(userData);
        await this.userRepository.save(user);
        console.log(`✅ User created: ${userData.email}`);
      } else {
        console.log(`ℹ️  User already exists: ${userData.email}`);
      }
    }
  }
}