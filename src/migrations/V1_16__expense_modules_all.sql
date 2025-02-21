
CREATE TABLE
    IF NOT EXISTS `expense-quotation_meta_data` (
        `id` int NOT NULL AUTO_INCREMENT,
        `showExpenseInvoiceAddress` boolean DEFAULT TRUE,
        `showDeliveryAddress` boolean DEFAULT TRUE,
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
        `quotationId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_article_article-expense-quotation-entry` (`articleId`),
        KEY `FK_expense-quotation_article-expense-quotation-entry` (`expense-quotationId`),
        CONSTRAINT `FK_article_article-expense-quotation-entry` FOREIGN KEY (`articleId`) REFERENCES `article` (`id`) ON DELETE SET NULL,
        CONSTRAINT `FK_expense-quotation_article-expense-quotation-entry` FOREIGN KEY (`expense-quotationId`) REFERENCES `expense-quotation` (`id`) ON DELETE SET NULL
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
        KEY `FK_articleExpenseQuotationEntry_article-expense-quotation-entry-tax` (`articleExpenseQuotationEntryId`),
        KEY `FK_tax_article-expense-quotation-entry-tax` (`taxId`),
        CONSTRAINT `FK_articleExpenseQuotationEntry_article-expense-quotation-entry-tax` FOREIGN KEY (`articleExpenseQuotationEntryId`) REFERENCES `article-expense-quotation-entry` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_tax_article-expense-quotation-entry-tax` FOREIGN KEY (`taxId`) REFERENCES `tax` (`id`) ON DELETE CASCADE
    );


    CREATE TABLE
    IF NOT EXISTS `expense-payment` (
        `id` int NOT NULL AUTO_INCREMENT,
        `amount` float DEFAULT NULL,
        `fee` float DEFAULT NULL,
        `convertionRate` float DEFAULT NULL,
        `date` datetime DEFAULT NULL,
        `mode` enum (
            'expense-payment.expense-payment_mode.cash',
            'expense-payment.expense-payment_mode.credit_card',
            'expense-payment.expense-payment_mode.check',
            'expense-payment.expense-payment_mode.bank_transfer',
            'expense-payment.expense-payment_mode.wire_transfer'
        ) DEFAULT NULL,
        `currencyId` int NOT NULL,
        `firmId` int NOT NULL,
        `notes` varchar(1024) DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_firm_expense-payment` (`firmId`),
        KEY `FK_currency_expense-payment` (`currencyId`),
        CONSTRAINT `FK_firm_expense-payment` FOREIGN KEY (`firmId`) REFERENCES `firm` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_currency_expense-payment` FOREIGN KEY (`currencyId`) REFERENCES `currency` (`id`) ON DELETE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS `expense-payment-upload` (
        `id` int NOT NULL AUTO_INCREMENT,
        `expensePaymentId` int DEFAULT NULL,
        `uploadId` int DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_expense-payment_expense-payment-upload` (`expensePaymentId`),
        KEY `FK_upload_expense-payment-upload` (`uploadId`),
        CONSTRAINT `FK_expense-payment_expense-payment-upload` FOREIGN KEY (`expensePaymentId`) REFERENCES `expense-payment` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_upload_expense-payment-upload` FOREIGN KEY (`uploadId`) REFERENCES `upload` (`id`) ON DELETE CASCADE
    );

CREATE TABLE
    IF NOT EXISTS `expense-payment-invoice_entry` (
        `id` int NOT NULL AUTO_INCREMENT,
        `expensePaymentId` int DEFAULT NULL,
        `expenseInvoiceId` int DEFAULT NULL,
        `amount` float DEFAULT NULL,
        `createdAt` TIMESTAMP DEFAULT NOW(),
        `updatedAt` TIMESTAMP DEFAULT NOW(),
        `deletedAt` TIMESTAMP DEFAULT NULL,
        `isDeletionRestricted` BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (`id`),
        KEY `FK_expense-payment_expense-payment-invoice` (`expensePaymentId`),
        KEY `FK_expense-invoice_expense-payment-invoice` (`expenseInvoiceId`),
        CONSTRAINT `FK_expense-payment_expense-payment-invoice` FOREIGN KEY (`expensePaymentId`) REFERENCES `expense-payment` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_expense-invoice_expense-payment-invoice` FOREIGN KEY (`expenseInvoiceId`) REFERENCES `expenseInvoice` (`id`) ON DELETE CASCADE
    );
/*
ALTER TABLE `expense-invoice`
ADD COLUMN `amountPaid` float DEFAULT 0;
*/


CREATE TABLE
    IF NOT EXISTS `invoice_meta_data` (
        `id` int NOT NULL AUTO_INCREMENT,
        `showInvoiceAddress` boolean DEFAULT TRUE,
        `showDeliveryAddress` boolean DEFAULT TRUE,
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
            'invoice.status.non_existent',
            'invoice.status.draft',
            'invoice.status.sent',
            'invoice.status.validated',
            'invoice.status.paid',
            'invoice.status.unpaid',
            'invoice.status.expired',
            'invoice.status.archived'
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
        CONSTRAINT `FK_expense-invoice_meta_data_expense-invoice` FOREIGN KEY (`expenseInvoiceMetaDataId`) REFERENCES `expenseInvoice_meta_data` (`id`) ON DELETE CASCADE
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
        CONSTRAINT `FK_expense-invoice_article-expense-invoice-entry` FOREIGN KEY (`expense-InvoiceId`) REFERENCES `expense-invoice` (`id`) ON DELETE SET NULL
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

ALTER TABLE `expense-invoice` MODIFY `status` ENUM (
    'invoice.status.non_existent',
    'invoice.status.draft',
    'invoice.status.sent',
    'invoice.status.validated',
    'invoice.status.paid',
    'invoice.status.partially_paid',
    'invoice.status.unpaid',
    'invoice.status.expired',
    'invoice.status.archived'
) DEFAULT NULL;