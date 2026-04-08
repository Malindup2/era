import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '12345',
      database: 'test_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule, // we add this later
  ],
  controllers: [],
  providers: [],
})

export class AppModule {}