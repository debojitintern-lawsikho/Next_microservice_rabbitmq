import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { MailService } from './mail.service';

@Controller()
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @EventPattern('user_logged_in')
  async handleUserLogin(data: { email: string; name: string }) {
    return this.mailService.handleUserLogin(data);
  }
}
