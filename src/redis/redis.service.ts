import { Injectable, Inject, Logger } from '@nestjs/common';
import { createClient, RedisClientType, RedisClientOptions } from 'redis';
import { from, interval, Subject } from 'rxjs';
export const REDIS_SERVICE = Symbol('REDIS_SERVICE');

export type RedisConnectOption = { url: string; database: number };

@Injectable()
export class RedisService {
  private client: RedisClientType;
  private connectOption: RedisConnectOption;
  private readonly expireSubject = new Subject<string>();

  constructor(options: Partial<RedisConnectOption>) {
    this.connectOption = Object.assign(
      {},
      { url: 'redis://localhost:6379', database: 0 },
      options,
    );
    this.startRedis();
  }

  async startRedis(): Promise<void> {
    this.client = createClient(this.connectOption);
    await this.client.connect();
    this.client.on('connect', () => {
      Logger.log(`Connect to redis ${this.connectOption.url} Successfully.`);
      this.client.configSet('notify-keyspace-events', 'Ex');
    });

    // subscribe expire key
    const subscriber = this.client.duplicate();
    subscriber.on('error', (err) => console.error(err));

    await subscriber.connect();
    subscriber.on('connect', () => {
      Logger.log(
        `subscribe expire key redis client ${this.connectOption.url} Successfully.`,
      );
    });
    await subscriber.subscribe(
      `__keyevent@${this.connectOption.database}__:expired`,
      (message, channel) => {
        this.expireSubject.next(message);
      },
    );
  }

  getClient(): RedisClientType {
    return this.client;
  }

  getExpireSubject(): Subject<string> {
    return this.expireSubject;
  }
}
