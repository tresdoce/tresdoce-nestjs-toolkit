import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  private cats: Cat[] = [
    {
      name: 'michi',
      age: 2,
    },
  ];

  findAll(): Cat[] {
    return this.cats;
  }
}
