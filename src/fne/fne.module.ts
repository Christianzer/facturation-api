import { Module } from '@nestjs/common';
import { FneService } from './fne.service';

@Module({
  providers: [FneService],
  exports: [FneService],
})
export class FneModule {}