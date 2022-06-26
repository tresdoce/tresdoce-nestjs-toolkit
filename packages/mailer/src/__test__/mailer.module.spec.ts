import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MailerModule } from '../mailer/mailer.module';
import { ConfigModule } from '@nestjs/config';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';

describe('MailerModule', () => {
  let app: INestApplication;

  describe('forRoot', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          MailerModule.forRoot({
            transport: 'smtps://user@domain.com:pass@smtp.domain.com',
            defaults: {
              from: '"nest-modules" <modules@nestjs.com>',
            },
          }),
        ],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    it('should be defined', () => {
      expect(app).toBeDefined();
    });
  });

  describe('forRootAsync', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [
              dynamicConfig({
                mailer: {
                  transport: 'smtps://user@domain.com:pass@smtp.domain.com',
                  defaults: {
                    from: '"nest-modules" <modules@nestjs.com>',
                  },
                },
              }),
            ],
          }),
          MailerModule,
        ],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    it('should be defined', () => {
      expect(app).toBeDefined();
    });
  });
});
