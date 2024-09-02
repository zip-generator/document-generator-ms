import { Module } from '@nestjs/common';
import { CarboneService } from './carbone.service';

@Module({
  providers: [CarboneService],
  exports: [CarboneService],
})
export class CarboneModule {}
