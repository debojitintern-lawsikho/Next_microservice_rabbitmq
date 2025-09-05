import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventPattern, Client, Transport } from '@nestjs/microservices';
import type { ClientGrpc } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as nodemailer from 'nodemailer';

interface ProductService {
  GetProductById(data: { id: number }): any;
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private productService: ProductService;

  @Client({
    transport: Transport.GRPC,
    options: {
      package: 'product',
      protoPath: join(__dirname, '../../product-service/dist/product/product.proto'),
      url: 'localhost:50052',
    },
  })
  private client: ClientGrpc;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  onModuleInit() {
    this.productService = this.client.getService<ProductService>('ProductService');
  }

  private async sendMail(to: string, subject: string, text: string) {
    await this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM'),
      to,
      subject,
      text,
    });
  }


  async handleUserLogin(data: { email: string; name: string }) {
    this.logger.log(`Handling user login event for user: ${data.email}`);
    await this.sendMail(data.email, 'Welcome Back!', `Hello ${data.name}, welcome back to our platform!`);
    this.logger.log(`Welcome email sent to: ${data.email}`);
  }

  async handleProductCreated(data: { id: number; userEmail: string }) {
    this.logger.log(`Handling product created event for product ID: ${data.id}`);
    const product = await this.productService.GetProductById({ id: data.id }).toPromise();
    await this.sendMail(product.userEmail, 'Product Created', `Your product "${product.name}" has been created.`);
    this.logger.log(`Product creation email sent to: ${product.userEmail}`);
  }

  async handleProductUpdated(data: { id: number; userEmail: string }) {
    this.logger.log(`Handling product updated event for product ID: ${data.id}`);
    const product = await this.productService.GetProductById({ id: data.id }).toPromise();
    await this.sendMail(product.userEmail, 'Product Updated', `Your product "${product.name}" has been updated.`);
    this.logger.log(`Product update email sent to: ${product.userEmail}`);
  }

  async handleProductDeleted(data: { id: number; userEmail: string }) {
    this.logger.log(`Handling product deleted event for product ID: ${data.id}`);
    await this.sendMail(data.userEmail, 'Product Deleted', `Your product has been deleted.`);
    this.logger.log(`Product deletion email sent to: ${data.userEmail}`);
  }
}
