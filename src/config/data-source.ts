/**
 * DataSource utilisée par la CLI TypeORM (génération / exécution manuelle des migrations).
 *   yarn migration:generate src/database/migrations/NomDeLaMigration
 *   yarn migration:run | yarn migration:revert | yarn migration:show
 * L'application, elle, exécute les migrations toute seule au démarrage (migrationsRun).
 */
import 'reflect-metadata';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { MIGRATIONS } from '../database/migrations';

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

export default new DataSource({
  type: 'mysql',
  host: process.env.APP_DB_HOST,
  port: Number(process.env.APP_DB_PORT ?? 3306),
  username: process.env.APP_DB_USERNAME,
  password: process.env.APP_DB_PASSWORD,
  database: process.env.APP_DB_NAME,
  charset: 'utf8mb4_unicode_ci',
  entities: [path.join(__dirname, '..', 'core', 'entities', '**', '*.{ts,js}')],
  migrations: MIGRATIONS,
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: ['error', 'warn', 'migration'],
});
