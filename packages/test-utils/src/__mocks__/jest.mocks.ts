import { appConfigBase } from '../fixtures';

export const config = jest.fn().mockImplementation(() => appConfigBase);
