//import { GenericContainer } from 'testcontainers';

export default class testContainers {
  private static _instance?: testContainers;
  private username = 'mdelgado';

  constructor(private image: string = 'postgres:13') {
    if (testContainers._instance) throw new Error('Use setupContainers.instance instead of new.');
    testContainers._instance = this;
  }

  public static get instance(): testContainers {
    return testContainers._instance ?? (testContainers._instance = new testContainers());
  }

  public async start(): Promise<void> {
    console.log('1 START: ', testContainers._instance);
    this.username = 'sarasa';
    console.log('2 START: ', testContainers._instance);
  }

  public async stop(): Promise<void> {
    console.log('1 STOP: ', testContainers._instance);
    this.username = '';
    console.log('2 STOP: ', testContainers._instance);
  }
}
