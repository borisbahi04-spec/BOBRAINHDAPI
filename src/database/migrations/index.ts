/**
 * Liste des migrations TypeORM, dans l'ordre.
 * Importées explicitement (et non par glob) car l'API est compilée avec webpack (bundle unique).
 * Ajouter ici chaque nouvelle migration générée.
 */
import { RequesterLabAgentOperator1795478400000 } from './1795478400000-RequesterLabAgentOperator';

export const MIGRATIONS = [RequesterLabAgentOperator1795478400000];
