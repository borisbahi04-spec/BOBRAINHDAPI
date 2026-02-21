/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Logger4jsService } from '@app/nestjs';

@Injectable()
export class MailerSenderService {
  constructor(
    private readonly mailerService: MailerService,
    private logger: Logger4jsService,
  ) {}

   async sendEmails(
    recipients: string[],
    subject: string,
    template: string,
    payload: any,
  ): Promise<void> {
    if (recipients.length === 0) {
      return;
    }
    const sendTasks = recipients.map((email) =>
      this.mailerService.sendMail({
        to: email,
        subject: subject,
        template: template,
        context: payload,
      }),
    );
    

    const results = await Promise.allSettled(sendTasks);

    const failed = results.filter((r) => r.status === 'rejected');
    console.log('Email send results:',failed, results);
    if (failed.length > 0) {
      this.logger.warn(
        `${failed.length} email(s) non envoyés sur ${recipients.length}`,
      );
    }
  }
}
