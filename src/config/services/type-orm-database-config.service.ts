import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common/decorators/core';
import { MIGRATIONS } from 'src/database/migrations';

/** 'true' / 'false' dans le .env, sinon valeur par défaut */
const envBool = (value: string | undefined, fallback: boolean) =>
  value === undefined || value.trim() === '' ? fallback : ['true', '1', 'yes'].includes(value.trim().toLowerCase());

@Injectable()
export class TypeOrmDatabaseConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}
  createTypeOrmOptions(): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.configService.get<string>('db.host'),
      port: this.configService.get<number>('db.port'),
      username: this.configService.get<string>('db.username'),
      password: this.configService.get<string>('db.password'),
      database: this.configService.get<string>('db.name'),
      autoLoadEntities: true,
      supportBigNumbers: true,
      logging: ['error', 'warn'],
      charset: 'utf8mb4_unicode_ci',
      retryAttempts: 3,
      retryDelay: 5000, // milliseconds
      // --- Mise à jour du schéma au démarrage (voir ADR-0018) ---
      // 1. Migrations versionnées : exécutées automatiquement au démarrage
      //    (table « typeorm_migrations »). Recommandé en production.
      migrations: MIGRATIONS,
      migrationsTableName: 'typeorm_migrations',
      migrationsRun: envBool(process.env.APP_DB_MIGRATIONS_RUN, true),
      migrationsTransactionMode: 'each',
      // 2. Synchronisation automatique des entités (ajout de tables/colonnes à partir
      //    des entités). Pratique en dev ; à n'activer en prod qu'en connaissance de cause.
      synchronize: envBool(process.env.APP_DB_SYNCHRONIZE, process.env.NODE_ENV !== 'production'),
    };
  }
}
