import { appConfigBase } from '../fixtures/index';

export const config = jest.fn().mockImplementation(() => appConfigBase);
