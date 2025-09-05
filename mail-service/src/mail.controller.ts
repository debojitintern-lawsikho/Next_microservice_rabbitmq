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

  @EventPattern('product_created')
  async handleProductCreated(data: { id: number; userEmail: string }) {
    return this.mailService.handleProductCreated(data);
  }

  @EventPattern('product_updated')
  async handleProductUpdated(data: { id: number; userEmail: string }) {
    return this.mailService.handleProductUpdated(data);
  }

  @EventPattern('product_deleted')
  async handleProductDeleted(data: { id: number; userEmail: string }) {
    return this.mailService.handleProductDeleted(data);
  }
}
