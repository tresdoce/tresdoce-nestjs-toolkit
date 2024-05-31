export type BcryptVersion = 'a' | 'b';

export interface BcryptOptions {
  rounds?: number;
  minor?: BcryptVersion;
}
