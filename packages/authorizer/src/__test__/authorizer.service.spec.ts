import { HttpException, HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LoginInput, SignupInput } from '@authorizerdev/authorizer-js';
import axios from 'axios';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';

import { AuthorizerModule } from '../authorizer/authorizer.module';
import { AuthorizerService } from '../authorizer/services/authorizer.service';
import { AUTHORIZER_CLIENT } from '../authorizer/constants/authorizer.constant';

const getClientID = async (baseUrl = 'http://localhost:3001'): Promise<string> => {
  const query = `
    query {
      meta {
        client_id
      }
    }
  `;

  const { data } = await axios.post(`${baseUrl}/graphql`,{
    query
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  return data.data.meta.client_id;
};

const testEmail = 'test@example.com';
const testPassword = 'Pa$$W0rd9865-t3st';
const wrongTestPassword = 'P@$$W0rd9865-test';


describe('AuthorizerService', () => {
  let app: INestApplication;
  let service: AuthorizerService;

  beforeEach(async () => {
    const authorizerURL: string = 'http://docker:3001';
    const clientID: string = await getClientID(authorizerURL);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [dynamicConfig({
            authorizer: {
              authorizerURL,
              redirectURL: `${authorizerURL}/app`,
              clientID,
            },
          })],
        }),
        AuthorizerModule,
      ],
      providers: [AuthorizerService],
    }).compile();

    app = moduleFixture.createNestApplication();
    service = moduleFixture.get<AuthorizerService>(AuthorizerService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have the AuthorizerClient available', () => {
    const client = app.get(AUTHORIZER_CLIENT);
    expect(client).toBeDefined();
  });

  describe('signUp', () => {
    it('should throw an error if email is missing', async () => {
      const signUpInput: SignupInput = {
        email: '',
        password: testPassword,
        confirm_password: testPassword,
      };

      await expect(service.signUp(signUpInput)).rejects.toThrow(HttpException);
      await expect(service.signUp(signUpInput)).rejects.toThrow('Email and password are required');
    });

    it('should throw an error if password and confirm password is missing', async () => {
      const signUpInput: SignupInput = {
        email: testEmail,
        password: '',
        confirm_password: '',
      };

      await expect(service.signUp(signUpInput)).rejects.toThrow(HttpException);
      await expect(service.signUp(signUpInput)).rejects.toThrow('Email and password are required');
    });

    it('should throw an error if email and password is missing', async () => {
      const signUpInput: SignupInput = {
        email: '',
        password: '',
        confirm_password: '',
      };

      await expect(service.signUp(signUpInput)).rejects.toThrow(HttpException);
      await expect(service.signUp(signUpInput)).rejects.toThrow('Email and password are required');
    });

    it('should throw an error if password is not valid', async () => {
      const signUpInput: SignupInput = {
        email: testEmail,
        password: 'pass123',
        confirm_password: 'pass123',
      };
      const result = await service.signUp(signUpInput);
      expect(result).toBeDefined();
      expect(result.data).toBeUndefined();
      expect(result.errors[0].message).toBe('password is not valid. It needs to be at least 6 characters long and contain at least one number, one uppercase letter, one lowercase letter and one special character');
    });

    it('should throw an error if password and confirm password does not match', async () => {
      const signUpInput: SignupInput = {
        email: testEmail,
        password: testPassword,
        confirm_password: wrongTestPassword,
      };

      const result = await service.signUp(signUpInput);
      expect(result).toBeDefined();
      expect(result.data).toBeUndefined();
      expect(result.errors[0].message).toBe('password and confirm password does not match');
    });

    it('should throw an error for an invalid email format', async () => {
      const signUpInput: SignupInput = {
        email: 'not-a-valid-email',
        password: testPassword,
        confirm_password: testPassword,
      };
      const result = await service.signUp(signUpInput);
      expect(result).toBeDefined();
      expect(result.data).toBeUndefined();
      expect(result.errors[0].message).toBe('invalid email address');
    });

    it('should handle server errors gracefully', async () => {
      const signUpInput: SignupInput = {
        email: testEmail,
        password: testPassword,
        confirm_password: testPassword,
      };

      jest.spyOn(service, 'signUp').mockRejectedValue(new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR));

      await expect(service.signUp(signUpInput)).rejects.toThrow(HttpException);
      await expect(service.signUp(signUpInput)).rejects.toThrow('Internal server error');
    });

    it('should ensure no SQL injection is possible via input fields', async () => {
      const signUpInput: SignupInput = {
        email: 'test@example.com; DROP TABLE users;',
        password: testPassword,
        confirm_password: testPassword,
      };
      const result = await service.signUp(signUpInput);
      expect(result).toBeDefined();
      expect(result.data).toBeUndefined();
      expect(result.errors[0].message).toBe('invalid email address');
    });

    it('should register a user', async () => {
      const signUpInput: SignupInput = {
        email: testEmail,
        password: testPassword,
        confirm_password: testPassword,
      };

      const result = await service.signUp(signUpInput);
      console.log(result)
      expect(result).toBeDefined();
      expect(result.data.message).toBe('Verification email has been sent. Please check your inbox');
      expect(result.errors.length).toBe(0);
    });

    it('should throw an error when registering an existing user', async () => {
      const signUpInput: SignupInput = {
        email: testEmail,
        password: wrongTestPassword,
        confirm_password: wrongTestPassword,
      };
      const result = await service.signUp(signUpInput);
      expect(result).toBeDefined();
      expect(result.data).toBeUndefined();
      expect(result.errors[0].message).toBe(`${signUpInput.email} has already signed up. please complete the email verification process or reset the password`);
    });
  });

  describe('login', () => {
    it('should throw an error if email is missing', async () => {
      const loginInput: LoginInput = {
        email: '',
        password: testPassword,
      };

      await expect(service.login(loginInput)).rejects.toThrow(HttpException);
      await expect(service.login(loginInput)).rejects.toThrow('Email and password are required');
    });

    it('should throw an error if password is missing', async () => {
      const loginInput: LoginInput = {
        email: testEmail,
        password: '',
      };

      await expect(service.login(loginInput)).rejects.toThrow(HttpException);
      await expect(service.login(loginInput)).rejects.toThrow('Email and password are required');
    });

    it('should throw an error for incorrect credentials', async () => {
      const loginInput: LoginInput = {
        email: testEmail,
        password: wrongTestPassword,
      };
      const result = await service.login(loginInput);
      expect(result).toBeDefined();
      expect(result.data.message).toBe('Please check email inbox for the OTP');
      expect(result.errors.length).toBe(0);
    });

    it('should handle server errors gracefully', async () => {
      const loginInput: LoginInput = {
        email: testEmail,
        password: testPassword,
      };

      jest.spyOn(service, 'login').mockRejectedValue(new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR));

      await expect(service.login(loginInput)).rejects.toThrow(HttpException);
      await expect(service.login(loginInput)).rejects.toThrow('Internal server error');
    });

    it('should successfully log in a user with correct credentials', async () => {
      const loginInput: LoginInput = {
        email: testEmail,
        password: testPassword,
      };

      const result = await service.login(loginInput);
      console.log(result)
      expect(result.data).toBeDefined();
      expect(result.data.access_token).toBeDefined();
    });
  });


});
