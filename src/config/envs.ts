import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  NATS_SERVERS: string[];
  API_KEY: string;
  INVOICE_QUERY_URL: string;
  REDIS_PORT: number;
  REDIS_HOST: string;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
    API_KEY: joi.string().required(),
    INVOICE_QUERY_URL: joi.string().required(),
    REDIS_PORT: joi.number().required(),
    REDIS_HOST: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  natsServers: envVars.NATS_SERVERS,
  apiKey: envVars.API_KEY,
  invoiceQueryUrl: envVars.INVOICE_QUERY_URL,
  redisPort: envVars.REDIS_PORT,
  redisHost: envVars.REDIS_HOST,
};
