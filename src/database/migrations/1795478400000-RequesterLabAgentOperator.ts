import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

/**
 * 2026-11-24 — Agents labo, opératrice et correction sur les demandes.
 *
 * Migration IDEMPOTENTE : chaque étape vérifie l'existant (table, colonne,
 * index, clé étrangère). Elle peut donc tourner sur une base déjà modifiée
 * par `synchronize` ou par le script SQL manuel sans erreur.
 */
export class RequesterLabAgentOperator1795478400000 implements MigrationInterface {
  name = 'RequesterLabAgentOperator1795478400000';

  public async up(qr: QueryRunner): Promise<void> {
    // 1. Table lab_agent
    if (!(await qr.hasTable('lab_agent'))) {
      await qr.createTable(
        new Table({
          name: 'lab_agent',
          columns: [
            { name: 'id', type: 'varchar', length: '36', isPrimary: true },
            { name: 'created_at', type: 'datetime', precision: 6, isNullable: true, default: 'CURRENT_TIMESTAMP(6)' },
            {
              name: 'updated_at',
              type: 'datetime',
              precision: 6,
              isNullable: true,
              default: 'CURRENT_TIMESTAMP(6)',
              onUpdate: 'CURRENT_TIMESTAMP(6)',
            },
            { name: 'deleted_at', type: 'datetime', precision: 6, isNullable: true },
            { name: 'closed_at', type: 'datetime', precision: 6, isNullable: true },
            { name: 'released_at', type: 'datetime', precision: 6, isNullable: true },
            { name: 'created_by_id', type: 'varchar', length: '36', isNullable: true },
            { name: 'updated_by_id', type: 'varchar', length: '36', isNullable: true },
            { name: 'deleted_by_id', type: 'varchar', length: '36', isNullable: true },
            { name: 'closed_by_id', type: 'varchar', length: '36', isNullable: true },
            { name: 'released_by_id', type: 'varchar', length: '36', isNullable: true },
            { name: 'matricule', type: 'varchar', length: '30' },
            { name: 'last_name', type: 'varchar', length: '80' },
            { name: 'first_name', type: 'varchar', length: '120', isNullable: true },
            { name: 'phone_number', type: 'varchar', length: '30', isNullable: true },
            { name: 'is_active', type: 'tinyint', default: 1 },
          ],
        }),
        true,
      );
    }
    await this.ensureIndex(qr, 'lab_agent', new TableIndex({ name: 'UQ_lab_agent_matricule', columnNames: ['matricule'], isUnique: true }));

    // 2. Colonnes de requester
    await this.ensureColumn(qr, 'requester', new TableColumn({ name: 'correction', type: 'text', isNullable: true }));
    await this.ensureColumn(qr, 'requester', new TableColumn({ name: 'lab_agent_id', type: 'varchar', length: '36', isNullable: true }));
    await this.ensureColumn(qr, 'requester', new TableColumn({ name: 'operator_id', type: 'varchar', length: '36', isNullable: true }));

    // 3. Index
    await this.ensureIndex(qr, 'requester', new TableIndex({ name: 'IDX_requester_lab_agent_id', columnNames: ['lab_agent_id'] }));
    await this.ensureIndex(qr, 'requester', new TableIndex({ name: 'IDX_requester_operator_id', columnNames: ['operator_id'] }));

    // 4. Clés étrangères (SET NULL : supprimer un agent / un utilisateur ne supprime pas la demande)
    await this.ensureForeignKey(
      qr,
      'requester',
      new TableForeignKey({
        name: 'FK_requester_lab_agent',
        columnNames: ['lab_agent_id'],
        referencedTableName: 'lab_agent',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
    await this.ensureForeignKey(
      qr,
      'requester',
      new TableForeignKey({
        name: 'FK_requester_operator',
        columnNames: ['operator_id'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(qr: QueryRunner): Promise<void> {
    const requester = await qr.getTable('requester');
    // copie : dropForeignKey modifie le tableau pendant l'itération
    for (const fk of [...(requester?.foreignKeys ?? [])]) {
      if (fk.columnNames.some((c) => c === 'lab_agent_id' || c === 'operator_id')) {
        await qr.dropForeignKey('requester', fk);
      }
    }
    for (const col of ['operator_id', 'lab_agent_id', 'correction']) {
      if (await qr.hasColumn('requester', col)) await qr.dropColumn('requester', col);
    }
    if (await qr.hasTable('lab_agent')) await qr.dropTable('lab_agent', true, true, true);
  }

  /* ------------------------------ utilitaires ------------------------------ */

  private async ensureColumn(qr: QueryRunner, table: string, column: TableColumn) {
    if (!(await qr.hasColumn(table, column.name))) await qr.addColumn(table, column);
  }

  private async ensureIndex(qr: QueryRunner, table: string, index: TableIndex) {
    const t = await qr.getTable(table);
    const same = (cols: string[]) => cols.length === index.columnNames.length && cols.every((c) => index.columnNames.includes(c));
    // un index (ou une contrainte unique) existe déjà sur ces colonnes, quel que soit son nom
    const exists =
      t?.indices.some((i) => i.name === index.name || (same(i.columnNames) && (!index.isUnique || i.isUnique))) ||
      (index.isUnique && t?.uniques.some((u) => same(u.columnNames)));
    if (!exists) await qr.createIndex(table, index);
  }

  private async ensureForeignKey(qr: QueryRunner, table: string, fk: TableForeignKey) {
    const t = await qr.getTable(table);
    const exists = t?.foreignKeys.some(
      (f) => f.name === fk.name || (f.columnNames.join() === fk.columnNames.join() && f.referencedTableName.endsWith(fk.referencedTableName)),
    );
    if (!exists) await qr.createForeignKey(table, fk);
  }
}
