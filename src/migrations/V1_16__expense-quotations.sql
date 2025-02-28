
CREATE TABLE
    IF NOT EXISTS `expense-quotation_meta_data` (
        `id` int NOT NULL AUTO_INCREMENT,
        -- `showExpenseInvoiceAddress` boolean DEFAULT TRUE,
        -- `showDeliveryAddress` boolean DEFAULT TRUE,
        `showArticleDescription` boolean DEFAULT TRUE,
        `hasBankingDetails` boolean DEFAULT TRUE,
        `hasGeneralConditions` boolean DEFAULT TRUE,
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
        `sequential` varchar(25) NOT NULL ,
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
        `expenseQuotationMetaDataId` int NOT NULL,
        `notes` varchar(1024) DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_currency_expense-quotation` (`currencyId`),
        KEY `FK_firm_expense-quotation` (`firmId`),
        KEY `FK_interlocutor_expense-quotation` (`interlocutorId`),
        KEY `FK_cabinet_expense-quotation` (`cabinetId`),
        KEY `FK_expense-quotation_meta_data_expense-quotation` (`expenseQuotationMetaDataId`),
        CONSTRAINT `FK_currency_expense-quotation` FOREIGN KEY (`currencyId`) REFERENCES `currency` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_firm_expense-quotation` FOREIGN KEY (`firmId`) REFERENCES `firm` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_interlocutor_expense-quotation` FOREIGN KEY (`interlocutorId`) REFERENCES `interlocutor` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_cabinet_expense-quotation` FOREIGN KEY (`cabinetId`) REFERENCES `cabinet` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_expense-quotation_meta_data_expense-quotation` FOREIGN KEY (`expenseQuotationMetaDataId`) REFERENCES `expense-quotation_meta_data` (`id`) ON DELETE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS `article-expense-quotation-entry` (
        `id` int NOT NULL AUTO_INCREMENT,
        `unit_price` float DEFAULT NULL,
        `quantity` float DEFAULT NULL,
        `discount` float DEFAULT NULL,
        `discount_type` enum ('PERCENTAGE', 'AMOUNT') DEFAULT NULL,
        `subTotal` float DEFAULT NULL,
        `total` float DEFAULT NULL,
        `articleId` int DEFAULT NULL,
        `expenseQuotationId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_article_article-expense-quotation-entry` (`articleId`),
        KEY `FK_expense-quotation_article-expense-quotation-entry` (`expenseQuotationId`),
        CONSTRAINT `FK_article_article-expense-quotation-entry` FOREIGN KEY (`articleId`) REFERENCES `article` (`id`) ON DELETE SET NULL,
        CONSTRAINT `FK_expense-quotation_article-expense-quotation-entry` FOREIGN KEY (`expenseQuotationId`) REFERENCES `expense-quotation` (`id`) ON DELETE SET NULL
    );

CREATE TABLE
IF NOT EXISTS `article-expense-quotation-entry-tax` (
    `id` int NOT NULL AUTO_INCREMENT,
    `articleExpenseQuotationEntryId` int NOT NULL,
    `taxId` int NOT NULL,
    `createdAt` TIMESTAMP DEFAULT NOW(),
    `updatedAt` TIMESTAMP DEFAULT NOW(),
    `deletedAt` TIMESTAMP DEFAULT NULL,
    `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (`id`),
    KEY `FK_articleExpQuotationEntry_article-exp-quotation-entry-tax` (`articleExpenseQuotationEntryId`),
    KEY `FK_tax_article-expense-quotation-entry-tax` (`taxId`),
    CONSTRAINT `FK_articleExpQuotationEntry_article-exp-quotation-entry-tax` FOREIGN KEY (`articleExpenseQuotationEntryId`) REFERENCES `article-expense-quotation-entry` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_tax_article-expense-quotation-entry-tax` FOREIGN KEY (`taxId`) REFERENCES `tax` (`id`) ON DELETE CASCADE
);



    CREATE TABLE
    IF NOT EXISTS `expense-quotation-upload` (
        `id` int NOT NULL AUTO_INCREMENT,
        `expenseQuotationId` int DEFAULT NULL,
        `uploadId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_expense-quotation_expense-quotation-upload` (`expenseQuotationId`),
        KEY `FK_upload_expense-quotation-upload` (`uploadId`),
        CONSTRAINT `FK_expense-quotation_expense-quotation-upload` FOREIGN KEY (`expenseQuotationId`) REFERENCES `expense-quotation` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_upload_expense-quotation-upload` FOREIGN KEY (`uploadId`) REFERENCES `upload` (`id`) ON DELETE CASCADE
    );

