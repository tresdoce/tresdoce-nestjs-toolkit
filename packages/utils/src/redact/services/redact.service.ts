import { Inject, Injectable } from '@nestjs/common';
import type fastRedact from 'fast-redact';

import { REDACT_PROVIDER } from '../constants/redact.constant.js';

@Injectable()
export class RedactService {
  constructor(@Inject(REDACT_PROVIDER) private readonly redact: fastRedact.redactFn) {}

  get redactRef(): fastRedact.redactFn | null {
    /* istanbul ignore next */
    return this.redact ? this.redact : null;
  }

  /**
   * Obfusca los paths configurados sobre una copia (JSON) de `_data`; el original no se modifica.
   * @param _data Objeto a ofuscar.
   * @param _serialize `true` (default) devuelve el resultado de fast-redact (objeto, salvo que se
   * configure `serialize`); `false` devuelve ese resultado como string JSON.
   */
  public obfuscate(_data: any, _serialize = true): any {
    const tempData = JSON.parse(JSON.stringify(_data));
    const dataRedacted = this.redactRef(tempData);
    return _serialize ? dataRedacted : JSON.stringify(dataRedacted);
  }
}
