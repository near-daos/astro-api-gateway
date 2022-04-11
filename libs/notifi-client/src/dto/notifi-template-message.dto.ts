import { NotifiTemplate } from '@sputnik-v2/notifi-client';

export class NotifiTemplateMessageDto {
  emailTemplate?: NotifiTemplate;
  smsTemplate?: NotifiTemplate;
  variables: Record<string, string>;
}
