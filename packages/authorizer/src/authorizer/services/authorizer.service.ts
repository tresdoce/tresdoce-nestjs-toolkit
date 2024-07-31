import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  ApiResponse,
  Authorizer,
  AuthToken,
  GenericResponse,
  Headers,
  LoginInput,
  SignupInput,
  User,
  ForgotPasswordInput,
  ForgotPasswordResponse,
  ResetPasswordInput,
  UpdateProfileInput,
  MagicLinkLoginInput,
  VerifyEmailInput,
  ResendVerifyEmailInput,
  VerifyOtpInput,
  ResendOtpInput,
  GraphqlQueryInput,
  AuthorizeInput,
  AuthorizeResponse,
  GetTokenInput,
  GetTokenResponse,
  ValidateJWTTokenInput,
  ValidateJWTTokenResponse,
  ValidateSessionInput,
  ValidateSessionResponse,
  RevokeTokenInput,
  OAuthProviders,
  MetaData,
} from '@authorizerdev/authorizer-js';

import { AUTHORIZER_CLIENT } from '../constants/authorizer.constant';

@Injectable()
export class AuthorizerService {
  /**
   * Service for managing authentication and user-related operations through the Authorizer API.
   */
  constructor(@Inject(AUTHORIZER_CLIENT) private readonly authorizerClient: Authorizer) {}

  /**
   * Provides access to the instantiated Authorizer client.
   * @returns {Authorizer} The Authorizer client instance.
   * @example
   * const authorizerClient = authorizerService.getClient();
   * const userProfile = await authorizerClient.getProfile({ authorization: 'Bearer yourAccessToken' });
   */
  getClient(): Authorizer {
    return this.authorizerClient;
  }

  // Autenticación Principal y Gestión de Sesiones
  /**
   * Registers a new user with the provided details.
   * @param {SignupInput} data The user's signup information.
   * @returns {Promise<ApiResponse<AuthToken>>} A token response upon successful registration.
   * @example
   * await authorizerService.signUp({
   *   email: 'user@example.com',
   *   password: 'password123',
   *   confirm_password: 'password123'
   * });
   */
  async signUp(data: SignupInput): Promise<ApiResponse<AuthToken>> {
    if (!data.email || !data.password) {
      throw new HttpException('Email and password are required', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.authorizerClient.signup(data);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to sign up',
        error.statusCode || HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Authenticates a user with their login credentials.
   * @param {LoginInput} data The user's login credentials.
   * @returns {Promise<ApiResponse<AuthToken>>} A token response upon successful authentication.
   * @example
   * await authorizerService.login({
   *   email: 'user@example.com',
   *   password: 'password123'
   * });
   */
  async login(data: LoginInput): Promise<ApiResponse<AuthToken>> {
    if (!data.email || !data.password) {
      throw new HttpException('Email and password are required', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.authorizerClient.login(data);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to login',
        error.statusCode || HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Logs out the current user, invalidating the session.
   * @param {Headers} headers Optional headers to include in the request.
   * @returns {Promise<ApiResponse<GenericResponse>>} A response indicating successful logout.
   * @example
   * await authorizerService.logout({
   *   authorization: 'Bearer yourAccessToken'
   * });
   */
  async logout(headers?: Headers): Promise<ApiResponse<GenericResponse>> {
    try {
      return await this.authorizerClient.logout(headers);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to logout',
        error.statusCode || HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Initiates an OAuth login process with the specified provider.
   * @param {OAuthProviders} provider The OAuth provider to use.
   * @param {string} redirect_uri The URI to redirect to after authentication.
   * @param {string} state Optional state to maintain between the request and the callback.
   * @returns {Promise<void>}
   * @example
   * await authorizerService.oauthLogin(OAuthProviders.Google, 'http://yourapp.com/callback', 'yourRandomState');
   */
  async oauthLogin(provider: OAuthProviders, redirect_uri?: string, state?: string): Promise<void> {
    try {
      await this.authorizerClient.oauthLogin(provider, [], redirect_uri, state);
    } catch (error) {
      throw new HttpException(error.message || 'OAuth login failed', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Starts a browser-based login process.
   * @returns {Promise<ApiResponse<AuthToken>>} A token response from browser-based login.
   * @example
   * const token = await authorizerService.browserLogin();
   */
  async browserLogin(): Promise<ApiResponse<AuthToken>> {
    try {
      return await this.authorizerClient.browserLogin();
    } catch (error) {
      throw new HttpException(error.message || 'Browser login failed', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Validates the current user session.
   * @param {ValidateSessionInput} data The session validation data.
   * @returns {Promise<ApiResponse<ValidateSessionResponse>>} Details about the session validity.
   * @example
   * const sessionInfo = await authorizerService.validateSession({
   *   headers: { authorization: 'Bearer yourAccessToken' }
   * });
   */
  async validateSession(data: ValidateSessionInput): Promise<ApiResponse<ValidateSessionResponse>> {
    try {
      return await this.authorizerClient.validateSession(data);
    } catch (error) {
      throw new HttpException(error.message || 'Session validation failed', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Retrieves the current session token details.
   * @param {Headers} headers Optional headers for the request.
   * @returns {Promise<ApiResponse<AuthToken>>} Details of the current token.
   * @example
   * const tokenDetails = await authorizerService.getSession({
   *   authorization: 'Bearer yourAccessToken'
   * });
   */
  async getSession(headers?: Headers): Promise<ApiResponse<AuthToken>> {
    try {
      return await this.authorizerClient.getSession(headers);
    } catch (error) {
      throw new HttpException(error.message || 'Failed to get session', HttpStatus.BAD_REQUEST);
    }
  }

  // Gestión de Usuarios y Perfiles
  /**
   * Retrieves the user profile associated with the provided headers.
   * @param {Headers} headers Authorization headers containing the user's token.
   * @returns {Promise<ApiResponse<User>>} Details of the user's profile.
   * @example
   * const userProfile = await authorizerService.getProfile({
   *   authorization: 'Bearer yourAccessToken'
   * });
   */
  async getProfile(headers?: Headers): Promise<ApiResponse<User>> {
    try {
      return await this.authorizerClient.getProfile(headers);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve profile',
        error.statusCode || HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Updates the user profile with the given data.
   * @param {UpdateProfileInput} data Data to update in the user's profile.
   * @param {Headers} headers Authorization headers.
   * @returns {Promise<ApiResponse<GenericResponse>>} Success message after updating the profile.
   * @example
   * const updateData = {
   *   email: 'newemail@example.com',
   *   given_name: 'John',
   *   family_name: 'Doe'
   * };
   * const response = await authorizerService.updateProfile(updateData, {
   *   authorization: 'Bearer yourAccessToken'
   * });
   */
  async updateProfile(
    data: UpdateProfileInput,
    headers?: Headers,
  ): Promise<ApiResponse<GenericResponse>> {
    try {
      return await this.authorizerClient.updateProfile(data, headers);
    } catch (error) {
      throw new HttpException(error.message || 'Failed to update profile', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Initiates the password recovery process for a user with the specified data.
   * @param {ForgotPasswordInput} data Data necessary for password recovery.
   * @returns {Promise<ApiResponse<ForgotPasswordResponse>>} Response containing recovery details.
   * @example
   * const recoveryData = {
   *   email: 'user@example.com'
   * };
   * const recoveryResponse = await authorizerService.forgotPassword(recoveryData);
   */
  async forgotPassword(data: ForgotPasswordInput): Promise<ApiResponse<ForgotPasswordResponse>> {
    try {
      return await this.authorizerClient.forgotPassword(data);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to process forgot password',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Resets the user's password using the provided data.
   * @param {ResetPasswordInput} data Data required for resetting the password.
   * @returns {Promise<ApiResponse<GenericResponse>>} Success response after resetting the password.
   * @example
   * const resetData = {
   *   token: 'passwordResetToken',
   *   password: 'newPassword123',
   *   confirm_password: 'newPassword123'
   * };
   * const resetResponse = await authorizerService.resetPassword(resetData);
   */
  async resetPassword(data: ResetPasswordInput): Promise<ApiResponse<GenericResponse>> {
    try {
      return await this.authorizerClient.resetPassword(data);
    } catch (error) {
      throw new HttpException(error.message || 'Failed to reset password', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Verifies a one-time password (OTP) for operations like two-factor authentication or password recovery.
   * @param {VerifyOtpInput} data OTP data to be verified.
   * @returns {Promise<ApiResponse<AuthToken>>} Token response after successful OTP verification.
   * @example
   * const otpData = {
   *   otp: '123456'
   * };
   * const tokenResponse = await authorizerService.verifyOtp(otpData);
   */
  async verifyOtp(data: VerifyOtpInput): Promise<ApiResponse<AuthToken>> {
    try {
      return await this.authorizerClient.verifyOtp(data);
    } catch (error) {
      throw new HttpException(error.message || 'Failed to verify OTP', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Resends a one-time password (OTP) for user operations like login or password recovery.
   * @param {ResendOtpInput} data Data specifying where to resend the OTP.
   * @returns {Promise<ApiResponse<GenericResponse>>} Success response indicating the OTP was resent.
   * @example
   * const resendData = {
   *   email: 'user@example.com'
   * };
   * const resendResponse = await authorizerService.resendOtp(resendData);
   */
  async resendOtp(data: ResendOtpInput): Promise<ApiResponse<GenericResponse>> {
    try {
      return await this.authorizerClient.resendOtp(data);
    } catch (error) {
      throw new HttpException(error.message || 'Failed to resend OTP', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Verifies the user's email using a verification token.
   * @param {VerifyEmailInput} data The data needed to verify the email.
   * @returns {Promise<ApiResponse<AuthToken>>} Token response after successful email verification.
   * @example
   * const verifyEmailData = {
   *   token: 'verificationToken123'
   * };
   * const response = await authorizerService.verifyEmail(verifyEmailData);
   */
  async verifyEmail(data: VerifyEmailInput): Promise<ApiResponse<AuthToken>> {
    try {
      return await this.authorizerClient.verifyEmail(data);
    } catch (error) {
      throw new HttpException(error.message || 'Failed to verify email', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Resends the verification email to the user.
   * @param {ResendVerifyEmailInput} data The data necessary to resend the verification email.
   * @returns {Promise<ApiResponse<GenericResponse>>} Success response indicating the email was resent.
   * @example
   * const resendVerifyEmailData = {
   *   email: 'user@example.com',
   *   identifier: 'uniqueIdentifier123'
   * };
   * const response = await authorizerService.resendVerifyEmail(resendVerifyEmailData);
   */
  async resendVerifyEmail(data: ResendVerifyEmailInput): Promise<ApiResponse<GenericResponse>> {
    try {
      return await this.authorizerClient.resendVerifyEmail(data);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to resend verify email',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // GraphQL Queries
  /**
   * Executes a GraphQL query against the Authorizer API.
   * @param {GraphqlQueryInput} data The query and variables for the GraphQL operation.
   * @returns {Promise<ApiResponse<any>>} The response from the GraphQL query.
   * @example
   * const queryData = {
   *   query: 'query { getUser { id email } }',
   *   variables: {}
   * };
   * const response = await authorizerService.graphqlQuery(queryData);
   */
  async graphqlQuery(data: GraphqlQueryInput): Promise<ApiResponse<any>> {
    try {
      return await this.authorizerClient.graphqlQuery(data);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to execute GraphQL query',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Authorization and Token Management
  /**
   * Initiates an authorization process with the specified parameters.
   * @param {AuthorizeInput} data The necessary parameters for the authorization.
   * @returns {Promise<ApiResponse<GetTokenResponse> | ApiResponse<AuthorizeResponse>>} The authorization response.
   * @example
   * const authData = {
   *   response_type: 'code',
   *   use_refresh_token: true
   * };
   * const response = await authorizerService.authorize(authData);
   */
  async authorize(
    data: AuthorizeInput,
  ): Promise<ApiResponse<GetTokenResponse> | ApiResponse<AuthorizeResponse>> {
    try {
      return await this.authorizerClient.authorize(data);
    } catch (error) {
      throw new HttpException(error.message || 'Authorization failed', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Retrieves a token using the provided credentials or tokens.
   * @param {GetTokenInput} data The data necessary for obtaining a token.
   * @returns {Promise<ApiResponse<GetTokenResponse>>} The token response.
   * @example
   * const tokenData = {
   *   code: 'authorizationCode123',
   *   grant_type: 'authorization_code'
   * };
   * const token = await authorizerService.getToken(tokenData);
   */
  async getToken(data: GetTokenInput): Promise<ApiResponse<GetTokenResponse>> {
    try {
      return await this.authorizerClient.getToken(data);
    } catch (error) {
      throw new HttpException(error.message || 'Failed to get token', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Validates a JWT token for authenticity and integrity.
   * @param {ValidateJWTTokenInput} data The token and type to be validated.
   * @returns {Promise<ApiResponse<ValidateJWTTokenResponse>>} The validation response.
   * @example
   * const jwtData = {
   *   token: 'jwtToken123',
   *   token_type: 'access_token'
   * };
   * const validation = await authorizerService.validateJWTToken(jwtData);
   */
  async validateJWTToken(
    data: ValidateJWTTokenInput,
  ): Promise<ApiResponse<ValidateJWTTokenResponse>> {
    try {
      return await this.authorizerClient.validateJWTToken(data);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to validate JWT token',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Revokes an existing token, such as an access or refresh token.
   * @param {RevokeTokenInput} data The token to be revoked.
   * @returns {Promise<ApiResponse<GenericResponse>>} The response after revocation.
   * @example
   * const revokeData = {
   *   refresh_token: 'refreshToken123'
   * };
   * const revokeResponse = await authorizerService.revokeToken(revokeData);
   */
  async revokeToken(data: RevokeTokenInput): Promise<ApiResponse<GenericResponse>> {
    try {
      return await this.authorizerClient.revokeToken(data);
    } catch (error) {
      throw new HttpException(error.message || 'Failed to revoke token', HttpStatus.BAD_REQUEST);
    }
  }

  // Autenticación Avanzada
  /**
   * Initiates a magic link login process.
   * @param {MagicLinkLoginInput} data The data required to initiate a magic link login.
   * @returns {Promise<ApiResponse<GenericResponse>>} The response to the magic link request.
   * @example
   * const magicLinkData = {
   *   email: 'user@example.com'
   * };
   * const magicResponse = await authorizerService.magicLinkLogin(magicLinkData);
   */
  async magicLinkLogin(data: MagicLinkLoginInput): Promise<ApiResponse<GenericResponse>> {
    try {
      return await this.authorizerClient.magicLinkLogin(data);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to process magic link login',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Metadata y Configuración
  /**
   * Retrieves metadata related to the authorization configurations.
   * @returns {Promise<ApiResponse<MetaData>>} The metadata of the authorizer configurations.
   * @example
   * const metadata = await authorizerService.getMetaData();
   */
  async getMetaData(): Promise<ApiResponse<MetaData>> {
    try {
      return await this.authorizerClient.getMetaData();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve metadata',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
