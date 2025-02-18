CREATE TABLE
    IF NOT EXISTS `expense-invoice` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `label` VARCHAR(255) NOT NULL,
        `description` VARCHAR(255) NOT NULL,
        `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`)
    );