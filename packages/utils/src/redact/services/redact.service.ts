import { Inject, Injectable } from '@nestjs/common';
import { REDACT_PROVIDER } from '../constants/redact.constant';

@Injectable()
export class RedactService {
  constructor(@Inject(REDACT_PROVIDER) private readonly redact) {}

  get redactRef() {
    /* istanbul ignore next */
    return this.redact ? this.redact : null;
  }

  /*
   * Obfuscate data
   */
  public obfuscate(_data: any, _serialize = true): any {
    const tempData = JSON.parse(JSON.stringify(_data));
    const dataRedacted = this.redactRef(tempData);
    return _serialize ? dataRedacted : JSON.stringify(dataRedacted);
  }
}
