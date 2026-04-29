import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { PROVIDER } from 'src/common/constants/provider.const';

@Injectable()
export class CachedService implements OnModuleInit {
  private readonly logger = new Logger(CachedService.name);
  constructor(
    @Inject(PROVIDER.CACHE_MANAGER) private readonly redis: Redis
  ) { }

  onModuleInit() {
    this.redis.on('connecting', () => {
      this.logger.log("Redis connecting...")
    })

    this.redis.on('ready', () => {
      this.logger.log("Redis ready")
    })

    this.redis.on('error', (err) => {
      this.logger.error('Redis Error:', err);
    });
  }

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async set(key: string, value: string | number, expireSeconds?: number): Promise<'OK'> {
    if (expireSeconds) {
      return await this.redis.set(key, value, 'EX', expireSeconds);
    }
    return await this.redis.set(key, value);
  }

  async setnx(key: string, value: string): Promise<number> {
    return await this.redis.setnx(key, value);
  }

  async del(key: string): Promise<number> {
    return await this.redis.del(key);
  }

  async exists(key: string): Promise<number> {
    return await this.redis.exists(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return await this.redis.expire(key, seconds);
  }

  async incr(key: string): Promise<number> {
    return await this.redis.incr(key);
  }

  async decr(key: string): Promise<number> {
    return await this.redis.decr(key);
  }

  // Hashes
  async hget(hash: string, field: string): Promise<string | null> {
    return await this.redis.hget(hash, field);
  }

  async hset(hash: string, field: string, value: string): Promise<number> {
    return await this.redis.hset(hash, field, value);
  }

  async hdel(hash: string, field: string): Promise<number> {
    return await this.redis.hdel(hash, field);
  }

  async hgetall(hash: string): Promise<Record<string, string>> {
    return await this.redis.hgetall(hash);
  }

  // Lists
  async lpush(key: string, ...values: string[]): Promise<number> {
    return await this.redis.lpush(key, ...values);
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    return await this.redis.rpush(key, ...values);
  }

  async lpop(key: string): Promise<string | null> {
    return await this.redis.lpop(key);
  }

  async rpop(key: string): Promise<string | null> {
    return await this.redis.rpop(key);
  }

  // Sets
  async sadd(key: string, ...members: string[]): Promise<number> {
    return await this.redis.sadd(key, ...members);
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    return await this.redis.srem(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    return await this.redis.smembers(key);
  }

  // Sorted Sets
  async zadd(key: string, ...args: (string | number)[]): Promise<number> {
    return await this.redis.zadd(key, ...args);
  }

  async zrange(key: string, start: number, stop: number, withScores = false): Promise<string[]> {
    if (withScores) {
      return await this.redis.zrange(key, start, stop, 'WITHSCORES');
    }
    return await this.redis.zrange(key, start, stop);
  }

  async zrem(key: string, ...members: string[]): Promise<number> {
    return await this.redis.zrem(key, ...members);
  }
}
