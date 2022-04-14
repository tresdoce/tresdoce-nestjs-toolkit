export interface MongoDatabaseConfig {
  connection: string;
  user: string;
  password: string;
  host: string;
  port: number;
  dbName: string;
}
