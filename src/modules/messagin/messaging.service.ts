import { envs } from '@app/config';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { connect, JetStreamClient, NatsConnection, StringCodec } from 'nats';
@Injectable()
export class MessagingService implements OnModuleInit, OnModuleDestroy {
  #logger = new Logger(MessagingService.name);
  private natsConnection: NatsConnection;
  private jetStreamClient: JetStreamClient;
  private stringCodec = StringCodec();

  constructor() {}
  async onModuleInit() {
    this.natsConnection = await connect({
      servers: envs.natsServers,
    });
    this.#logger.log('Conexión a NATS establecida.');
    this.jetStreamClient = this.natsConnection.jetstream();
    this.stringCodec = StringCodec();
  }
  async onModuleDestroy() {
    if (this.natsConnection) {
      await this.natsConnection.close();
      console.log('Conexión a NATS cerrada.');
    }
  }

  async publishMessage<T>(subject: string, data: T) {
    try {
      const message = JSON.stringify(data);
      await this.jetStreamClient.publish(
        subject,
        this.stringCodec.encode(message),
      );
      this.#logger.log(`Message published to ${subject}`);
    } catch (error) {
      this.#logger.error('Error al publicar mensaje en NATS', error);
      throw error;
    }
  }
}
