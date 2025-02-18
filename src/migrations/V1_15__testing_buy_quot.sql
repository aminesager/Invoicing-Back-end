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
CREATE TABLE
    IF NOT EXISTS `expense-quotation_meta_data` (
        `id` int NOT NULL AUTO_INCREMENT,
        `showInvoiceAddress` boolean DEFAULT TRUE,
        `showDeliveryAddress` boolean DEFAULT TRUE,
        `showArticleDescription` boolean DEFAULT TRUE,
        `hasBankingDetails` boolean DEFAULT TRUE,
        `hasGeneralConditions` boolean DEFAULT TRUE,
        `hasTaxStamp` boolean DEFAULT TRUE,
        `taxSummary` json DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`)
    );

CREATE TABLE
    IF NOT EXISTS `expense-quotation` (
        `id` int NOT NULL AUTO_INCREMENT,
        `sequential` varchar(25) NOT NULL UNIQUE,
        `date` datetime DEFAULT NULL,
        `dueDate` datetime DEFAULT NULL,
        `object` varchar(255) DEFAULT NULL,
        `generalConditions` varchar(1024) DEFAULT NULL,
        `status` enum (
            'expense-quotation.status.non_existent',
            'expense-quotation.status.expired',
            'expense-quotation.status.draft',
            'expense-quotation.status.validated',
            'expense-quotation.status.sent',
            'expense-quotation.status.accepted',
            'expense-quotation.status.rejected'
        ) DEFAULT NULL,
        `discount` float DEFAULT NULL,
        `discount_type` enum ('PERCENTAGE', 'AMOUNT') DEFAULT NULL,
        `subTotal` float DEFAULT NULL,
        `total` float DEFAULT NULL,
        `currencyId` int NOT NULL,
        `firmId` int NOT NULL,
        `interlocutorId` int NOT NULL,
        `cabinetId` int NOT NULL,
        `expense-quotationMetaDataId` int NOT NULL,
        `notes` varchar(1024) DEFAULT NULL,
        `taxStamp` float DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_currency_expense-quotation` (`currencyId`),
        KEY `FK_firm_expense-quotation` (`firmId`),
        KEY `FK_interlocutor_expense-quotation` (`interlocutorId`),
        KEY `FK_cabinet_expense-quotation` (`cabinetId`),
        KEY `FK_expense-quotation_meta_data_expense-quotation` (`expense-quotationMetaDataId`),
        CONSTRAINT `FK_currency_expense-quotation` FOREIGN KEY (`currencyId`) REFERENCES `currency` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_firm_expense-quotation` FOREIGN KEY (`firmId`) REFERENCES `firm` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_interlocutor_expense-quotation` FOREIGN KEY (`interlocutorId`) REFERENCES `interlocutor` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_cabinet_expense-quotation` FOREIGN KEY (`cabinetId`) REFERENCES `cabinet` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_expense-quotation_meta_data_expense-quotation` FOREIGN KEY (`expense-quotationMetaDataId`) REFERENCES `expense-quotation_meta_data` (`id`) ON DELETE CASCADE
    );