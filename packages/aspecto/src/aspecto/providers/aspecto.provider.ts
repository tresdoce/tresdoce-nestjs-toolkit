import { Provider } from '@nestjs/common';
import { ASPECTO_CLIENT, ASPECTO_MODULE_OPTIONS } from '../constants/aspecto.constant';

import AspectoInstrument from '@aspecto/opentelemetry';
import AspectoClientOptions from '@aspecto/opentelemetry/dist/src/interfaces/AspectoClientOptions';

export const createAspectoClient = (): Provider => ({
  provide: ASPECTO_CLIENT,
  useFactory: async (options: AspectoClientOptions) => AspectoInstrument({ ...options }),
  inject: [ASPECTO_MODULE_OPTIONS],
});
