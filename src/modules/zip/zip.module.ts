import { Module } from '@nestjs/common';
import { ZipServiceArchiver } from './zip-archiver.service';

@Module({
  controllers: [],
  providers: [ZipServiceArchiver],
  exports: [ZipServiceArchiver],
})
export class ZipModule {}
