import { envs } from '@app/config';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: envs.redisHost,
        port: envs.redisPort,
      },
    }),
  ],
})
export class BullMqModule {}
