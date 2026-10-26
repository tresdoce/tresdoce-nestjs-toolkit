import { Injectable, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { RedactModule } from '../redact/redact.module.js';
import { RedactService } from '../redact/services/redact.service.js';

const payload = { secret: 'my-secret-value' };

@Injectable()
class LibAConsumer {
  constructor(readonly redact: RedactService) {}
}

@Injectable()
class AppConsumer {
  constructor(readonly redact: RedactService) {}
}

@Injectable()
class LibBConsumer {
  constructor(readonly redact: RedactService) {}
}

@Module({
  imports: [
    RedactModule.registerAsync({
      isGlobal: false,
      useFactory: () => ({ paths: ['secret'], censor: '[lib-a]', obfuscateFrom: 'left' }),
    }),
  ],
  providers: [LibAConsumer],
  exports: [LibAConsumer],
})
class LibAModule {}

@Module({
  imports: [RedactModule.register({ paths: ['secret'], censor: '[lib-b]' }, false)],
  providers: [LibBConsumer],
  exports: [LibBConsumer],
})
class LibBModule {}

describe('RedactModule - isGlobal', () => {
  it('should keep local redaction configs isolated from each other and from the global one', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        RedactModule.register({ paths: ['secret'], censor: '[app]' }),
        LibAModule,
        LibBModule,
      ],
      providers: [AppConsumer],
    }).compile();

    const libA = moduleRef.get(LibAConsumer).redact.obfuscate(payload);
    const libB = moduleRef.get(LibBConsumer).redact.obfuscate(payload);
    const app = moduleRef.get(AppConsumer).redact.obfuscate(payload);

    expect(libA.secret.startsWith('[lib-a]')).toBe(true);
    expect(libB.secret.endsWith('[lib-b]')).toBe(true);
    expect(app.secret.endsWith('[app]')).toBe(true);
    await moduleRef.close();
  });

  it('should register globally by default', () => {
    expect(RedactModule.register({}).global).toBe(true);
    expect(RedactModule.registerAsync({ useFactory: () => ({}) }).global).toBe(true);
    expect(RedactModule.registerAsync({ isGlobal: false, useFactory: () => ({}) }).global).toBe(
      false,
    );
  });
});
