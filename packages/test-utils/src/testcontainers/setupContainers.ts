//import { GenericContainer } from 'testcontainers';

export default class setupContainers {
  private myInstance: string;
  private username = 'mdelgado';

  constructor(private readonly image: string = 'postgres:13') {
    //console.log("IMAGE: ",this.image)
    //console.log("USERNAME: ",this.username)
  }

  public async start(): Promise<void> {
    console.log('1 START: ', this.myInstance);
    this.myInstance = 'init';
    console.log('2 START: ', this.myInstance);
  }

  public async stop(): Promise<void> {
    console.log('1 STOP: ', this.myInstance);
    this.myInstance = 'end';
    console.log('2 STOP: ', this.myInstance);
  }
}
