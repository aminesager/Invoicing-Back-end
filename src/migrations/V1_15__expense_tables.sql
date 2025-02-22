CREATE TABLE
IF NOT EXISTS `expense-payment_condition` (
    `id` int NOT NULL AUTO_INCREMENT,
    `label` varchar(255) DEFAULT NULL,
    `description` varchar(1024) DEFAULT NULL,
    `createdAt` TIMESTAMP DEFAULT NOW(),
    `updatedAt` TIMESTAMP DEFAULT NOW(),
    `deletedAt` TIMESTAMP DEFAULT NULL,
    `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (`id`)
);

