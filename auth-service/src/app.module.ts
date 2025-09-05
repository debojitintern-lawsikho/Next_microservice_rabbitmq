import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'Debojit1998',
      database: 'Next_User_DB',
      entities: [User],
      synchronize: true, // ❗ For dev only
    }),
    AuthModule,
  ],
})
export class AppModule {}
