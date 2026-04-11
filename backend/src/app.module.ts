import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { ItemsModule } from './items/items.module';
import { InvoicesModule } from './invoices/invoices.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { QuotationsModule } from './quotations/quotations.module';
import { CreditNotesModule } from './credit-notes/credit-notes.module';

@Module({


  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT') || 5432,
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        ssl: configService.get<string>('NODE_ENV') === 'production' || configService.get<string>('DB_HOST')?.includes('rds.amazonaws.com') ? {
          ca: fs.readFileSync(path.join(process.cwd(), 'global-bundle.pem')),
          rejectUnauthorized: true,
        } : false,
      }),
    }),
    UsersModule,
    AuthModule,
    CustomersModule,
    ItemsModule,
    InvoicesModule,
    DashboardModule,
    QuotationsModule,
    CreditNotesModule,
  ],







  controllers: [],
  providers: [],
})
export class AppModule {}