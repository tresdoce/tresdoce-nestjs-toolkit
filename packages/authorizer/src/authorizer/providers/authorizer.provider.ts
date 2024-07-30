import { Provider } from '@nestjs/common';
import { Authorizer } from '@authorizerdev/authorizer-js'

import { AUTHORIZER_CLIENT, AUTHORIZER_MODULE_OPTIONS } from '../constants/authorizer.constant';
import { AuthorizerModuleOptions } from '../interfaces/authorizer.interface';

export const AuthorizerProvider = (): Provider => ({
  provide: AUTHORIZER_CLIENT,
  useFactory: async (options: AuthorizerModuleOptions): Promise<Authorizer> => new Authorizer(options),
  inject: [AUTHORIZER_MODULE_OPTIONS]
})
