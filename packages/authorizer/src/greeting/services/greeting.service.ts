import { Injectable } from '@nestjs/common';
import { Authorizer } from '@authorizerdev/authorizer-js';

@Injectable()
export class GreetingService {
  private authRef: any;

  constructor() {
    this.authRef = new Authorizer({
      authorizerURL: 'http://localhost:3001',
      clientID: '2fc61984-27fe-4835-bc54-5ce94b5ad279',
      redirectURL: 'http://localhost:3001/app',
    });
  }

  async getHello(): Promise<string> {
    const { data, errors } = await this.authRef.login({
      email: 'mdelgado@tresdoce.com.ar',
      password: '2Wsdfgt543@',
    })
    console.log(data);

    const data2 = await this.authRef.getProfile({
      Authorization: `Bearer ${data.access_token}`,
    })

    console.log(data2);

    return '¡Hello from the new package authorizer!';
  }
}
