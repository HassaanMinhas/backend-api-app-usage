import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private pool: Pool;

  constructor(private config: ConfigService) { }

  onModuleInit() {
    const isDevelopment = this.config.get('NODE_ENV') === 'development';
    
    const poolConfig: any = {
      host: this.config.get('PG_HOST'),
      port: Number(this.config.get('PG_PORT')),
      user: this.config.get('PG_USER'),
      password: this.config.get('PG_PASSWORD'),
      database: this.config.get('PG_DATABASE'),
    };

  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
  
    this.pool = new Pool(poolConfig);
  }

  query(text: string, params?: any[]) {
    return this.pool.query(text, params);
  }
}