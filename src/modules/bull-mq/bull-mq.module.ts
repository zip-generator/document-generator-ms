import { envs } from '@app/config';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

const maxQueueLimit = 10;
const queueDuration = 5000; // 5 seconds
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: envs.redisHost,
        port: envs.redisPort,
      },
      limiter: {
        max: maxQueueLimit,
        duration: queueDuration,
      },
    }),
  ],
})
export class BullMqModule {}
