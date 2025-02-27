CREATE TABLE
    IF NOT EXISTS `expense-invoice_meta_data` (
        `id` int NOT NULL AUTO_INCREMENT,
        -- `showInvoiceAddress` boolean DEFAULT TRUE,
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
    IF NOT EXISTS `expense-invoice` (
        `id` int NOT NULL AUTO_INCREMENT,
        `amountPaid` float DEFAULT 0,
        `sequential` varchar(25) NOT NULL UNIQUE,
        `date` datetime DEFAULT NULL,
        `dueDate` datetime DEFAULT NULL,
        `object` varchar(255) DEFAULT NULL,
        `generalConditions` varchar(1024) DEFAULT NULL,
        `status` enum (
            'expense-invoice.status.non_existent',
            'expense-invoice.status.draft',
            'expense-invoice.status.sent',
            'expense-invoice.status.validated',
            'expense-invoice.status.paid',
            'expense-invoice.status.unpaid',
            'expense-invoice.status.expired',
            'expense-invoice.status.archived'
        ) DEFAULT NULL,
        `discount` float DEFAULT NULL,
        `discount_type` enum ('PERCENTAGE', 'AMOUNT') DEFAULT NULL,
        `subTotal` float DEFAULT NULL,
        `total` float DEFAULT NULL,
        `currencyId` int NOT NULL,
        `firmId` int NOT NULL,
        `interlocutorId` int NOT NULL,
        `cabinetId` int NOT NULL,
        `expenseInvoiceMetaDataId` int NOT NULL,
        `notes` varchar(1024) DEFAULT NULL,
        `bankAccountId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_currency_expense-invoice` (`currencyId`),
        KEY `FK_firm_expense-invoice` (`firmId`),
        KEY `FK_interlocutor_expense-invoice` (`interlocutorId`),
        KEY `FK_cabinet_expense-invoice` (`cabinetId`),
        KEY `FK_expense-invoice_meta_data_expense-invoice` (`expenseInvoiceMetaDataId`),
        CONSTRAINT `FK_currency_expense-invoice` FOREIGN KEY (`currencyId`) REFERENCES `currency` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_firm_expense-invoice` FOREIGN KEY (`firmId`) REFERENCES `firm` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_interlocutor_expense-invoice` FOREIGN KEY (`interlocutorId`) REFERENCES `interlocutor` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_cabinet_expense-invoice` FOREIGN KEY (`cabinetId`) REFERENCES `cabinet` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_bank_account_expense-invoice` FOREIGN KEY (`bankAccountId`) REFERENCES `bank_account` (`id`) ON DELETE SET NULL,
        CONSTRAINT `FK_expense-invoice_meta_data_expense-invoice` FOREIGN KEY (`expenseInvoiceMetaDataId`) REFERENCES `expense-invoice_meta_data` (`id`) ON DELETE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS `article-expense-invoice-entry` (
        `id` int NOT NULL AUTO_INCREMENT,
        `unit_price` float DEFAULT NULL,
        `quantity` float DEFAULT NULL,
        `discount` float DEFAULT NULL,
        `discount_type` enum ('PERCENTAGE', 'AMOUNT') DEFAULT NULL,
        `subTotal` float DEFAULT NULL,
        `total` float DEFAULT NULL,
        `articleId` int DEFAULT NULL,
        `expenseInvoiceId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_article_article-expense-invoice-entry` (`articleId`),
        KEY `FK_expense-invoice_article-expense-invoice-entry` (`expenseInvoiceId`),
        CONSTRAINT `FK_article_article-expense-invoice-entry` FOREIGN KEY (`articleId`) REFERENCES `article` (`id`) ON DELETE SET NULL,
        CONSTRAINT `FK_expense-invoice_article-expense-invoice-entry` FOREIGN KEY (`expenseInvoiceId`) REFERENCES `expense-invoice` (`id`) ON DELETE SET NULL
    );

CREATE TABLE
    IF NOT EXISTS `article-expense-invoice-entry-tax` (
        `id` int NOT NULL AUTO_INCREMENT,
        `articleExpenseInvoiceEntryId` int NOT NULL,
        `taxId` int NOT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_articleExpenseInvoiceEntry_article-expense-invoice-entry-tax` (`articleExpenseInvoiceEntryId`),
        KEY `FK_tax_article-expense-invoice-entry-tax` (`taxId`),
        CONSTRAINT `FK_articleExpenseInvoiceEntry_article-expense-invoice-entry-tax` FOREIGN KEY (`articleExpenseInvoiceEntryId`) REFERENCES `article-expense-invoice-entry` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_tax_article-expense-invoice-entry-tax` FOREIGN KEY (`taxId`) REFERENCES `tax` (`id`) ON DELETE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS `expense-invoice-upload` (
        `id` int NOT NULL AUTO_INCREMENT,
        `expenseInvoiceId` int DEFAULT NULL,
        `uploadId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_expense-invoice_expense-invoice-upload` (`expenseInvoiceId`),
        KEY `FK_upload_expense-invoice-upload` (`uploadId`),
        CONSTRAINT `FK_expense-invoice_expense-invoice-upload` FOREIGN KEY (`expenseInvoiceId`) REFERENCES `expense-invoice` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_upload_expense-invoice-upload` FOREIGN KEY (`uploadId`) REFERENCES `upload` (`id`) ON DELETE CASCADE
    );



