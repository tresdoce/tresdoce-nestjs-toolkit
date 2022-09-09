import { Inject, Injectable } from '@nestjs/common';
import { ASPECTO_CLIENT } from '../constants/aspecto.constant';

@Injectable()
export class AspectoService {
  constructor(@Inject(ASPECTO_CLIENT) private readonly aspectoClient: any) {}

  get clientRef() {
    return this.aspectoClient;
  }

  public async getCtx(): Promise<void> {
    this.clientRef.getContext();
  }
}
