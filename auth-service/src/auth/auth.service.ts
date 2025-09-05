import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  private client: ClientProxy;

  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@localhost:5672'],
        queue: 'mail_queue',
        queueOptions: { durable: false },
      },
    });
  }

  async register(name: string, email: string, password: string) {
    const hash = await bcrypt.hash(password, 10);
    const user = this.usersRepo.create({ name, email, password: hash });
    return this.usersRepo.save(user);
  }

  async login(email: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) return { message: 'Invalid credentials' };

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return { message: 'Invalid credentials' };

    // Emit event after login
    this.client.emit('user_logged_in', { email: user.email, name: user.name });

    return { message: 'Login successful', data: user };
  }
}
