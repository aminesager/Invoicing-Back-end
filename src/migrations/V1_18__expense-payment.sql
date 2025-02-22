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
        CONSTRAINT `FK_expense-invoice_expense-payment-invoice` FOREIGN KEY (`expenseInvoiceId`) REFERENCES `expense-invoice` (`id`) ON DELETE CASCADE
    );


