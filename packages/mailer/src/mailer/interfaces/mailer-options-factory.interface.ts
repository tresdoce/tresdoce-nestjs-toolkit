/** Interfaces **/
import { MailerOptions } from './mailer-options.interface.js';

export interface MailerOptionsFactory {
  createMailerOptions(): Promise<MailerOptions> | MailerOptions;
}
