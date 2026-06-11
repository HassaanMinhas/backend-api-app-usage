import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { HeartbeatModule } from './modules/heartbeat/heartbeat.module';
import { BusinessUserModule } from './modules/business-user/business-user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const nodeEnv = process.env.NODE_ENV ?? 'development';
const envFilePath = [
  `.env.${nodeEnv}.local`,
  '.env.local',
  `.env.${nodeEnv}`,
  '.env',
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
    }),
    DatabaseModule,
    HeartbeatModule,
    BusinessUserModule,
  ],
  controllers: [AppController], 
  providers: [AppService], 
})
export class AppModule {}
