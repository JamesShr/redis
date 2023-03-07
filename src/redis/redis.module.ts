import { DynamicModule, Module } from '@nestjs/common';
import { RedisService, RedisConnectOption } from './redis.service';
import { IoRedisService } from './ioRedis.service';
import { RedisOptions } from 'ioredis';

@Module({})
export class RedisModule {
  static forRoot(
    options: Partial<{ redis?: RedisConnectOption; ioRedis?: RedisOptions }>,
  ): DynamicModule {
    const providers = [];

    if (options.redis) {
      providers.push({
        provide: RedisService,
        useValue: new RedisService(options.redis),
      });
    }
    if (options.ioRedis) {
      providers.push({
        provide: IoRedisService,
        useValue: new IoRedisService(options.ioRedis),
      });
    }
    return {
      providers: providers,
      exports: providers,
      module: RedisModule,
    };
  }
}
