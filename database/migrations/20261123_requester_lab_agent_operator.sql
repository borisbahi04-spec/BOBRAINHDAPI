-- =====================================================================
--  BOBRAIN HELPDESK — Migration 2026-11-23
--  Base : bobrain_db (MySQL / MariaDB) — même base que l'existant
--
--  - Nouvelle table  lab_agent  (agents labo)
--  - requester : + correction, + lab_agent_id, + operator_id
--  - requester.title est CONSERVÉ (historique) mais n'est plus saisi
--
--  ⚠ Depuis l'ADR-0018, ces changements sont appliqués AUTOMATIQUEMENT au démarrage
--  de l'API par la migration TypeORM src/database/migrations/1795478400000-*.ts
--  (APP_DB_MIGRATIONS_RUN=true). Ce script reste une alternative manuelle :
--     mysqldump -u root -p bobrain_db > backup_bobrain_db.sql
--     mysql     -u root -p bobrain_db < 20261123_requester_lab_agent_operator.sql
-- =====================================================================

START TRANSACTION;

CREATE TABLE IF NOT EXISTS `lab_agent` (
  `id`             varchar(36)  NOT NULL,
  `created_at`     datetime(6)  NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at`     datetime(6)  NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at`     datetime(6)  NULL,
  `closed_at`      datetime(6)  NULL,
  `released_at`    datetime(6)  NULL,
  `created_by_id`  varchar(36)  NULL,
  `updated_by_id`  varchar(36)  NULL,
  `deleted_by_id`  varchar(36)  NULL,
  `closed_by_id`   varchar(36)  NULL,
  `released_by_id` varchar(36)  NULL,
  `matricule`      varchar(30)  NOT NULL,
  `last_name`      varchar(80)  NOT NULL,
  `first_name`     varchar(120) NULL,
  `phone_number`   varchar(30)  NULL,
  `is_active`      tinyint      NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_lab_agent_matricule` (`matricule`)
) ENGINE=InnoDB;

ALTER TABLE `requester`
  ADD COLUMN `correction`   text        NULL AFTER `description`,
  ADD COLUMN `lab_agent_id` varchar(36) NULL,
  ADD COLUMN `operator_id`  varchar(36) NULL;

CREATE INDEX `IDX_requester_lab_agent_id` ON `requester` (`lab_agent_id`);
CREATE INDEX `IDX_requester_operator_id`  ON `requester` (`operator_id`);

ALTER TABLE `requester`
  ADD CONSTRAINT `FK_requester_lab_agent`
    FOREIGN KEY (`lab_agent_id`) REFERENCES `lab_agent` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_requester_operator`
    FOREIGN KEY (`operator_id`) REFERENCES `user` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Les anciennes demandes gardent leur `title` (affiché comme « Ancien titre »
-- dans l'écran de détail) ; correction / agent / opératrice restent vides.

COMMIT;

-- ---------------------------------------------------------------------
-- ROLLBACK (si besoin)
-- ALTER TABLE `requester` DROP FOREIGN KEY `FK_requester_lab_agent`,
--                         DROP FOREIGN KEY `FK_requester_operator`;
-- ALTER TABLE `requester` DROP COLUMN `correction`,
--                         DROP COLUMN `lab_agent_id`, DROP COLUMN `operator_id`;
-- DROP TABLE `lab_agent`;
-- ---------------------------------------------------------------------
