import { getCode } from '../';
import { HttpStatus } from '@nestjs/common';

describe('error.utils', () => {
  it('should be return code in string', () => {
    const code = getCode(HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR]);
    expect(code).toEqual('INTERNAL_SERVER_ERROR');
  });

  it('should be return code in string obj', () => {
    const code = getCode({ error: HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR] });
    expect(code).toEqual('INTERNAL_SERVER_ERROR');
  });

  it('should be return code in string', () => {
    const code = getCode({ error: HttpStatus['TEST_ERROR'] });
    expect(code).toEqual('INTERNAL_SERVER_ERROR');
  });
});
