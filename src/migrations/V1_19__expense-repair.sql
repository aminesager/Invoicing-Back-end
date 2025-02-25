ALTER TABLE `expense-invoice`
ADD COLUMN `taxWithholdingId` INT NULL,
ADD CONSTRAINT `FK_expense-invoice_tax_withholding` 
    FOREIGN KEY (`taxWithholdingId`) 
    REFERENCES `tax-withholding` (`id`) 
    ON DELETE SET NULL;

ALTER TABLE `expense-invoice_meta_data`
ADD COLUMN `hasTaxWithholding` BOOLEAN DEFAULT FALSE;

ALTER TABLE `expense-invoice`
ADD COLUMN `taxWithholdingAmount` FLOAT DEFAULT NULL;


ALTER TABLE `expense-quotation`
ADD COLUMN `bankAccountId` int DEFAULT NULL,
ADD CONSTRAINT `FK_bank_account_expense-quotation` FOREIGN KEY (`bankAccountId`) REFERENCES `bank_account` (`id`) ON DELETE SET NULL;

ALTER TABLE `expense-invoice`
ADD COLUMN `expenseQuotationId` INT NULL,
ADD CONSTRAINT `FK_expense-invoice_expense-quotation` FOREIGN KEY (`expenseQuotationId`) REFERENCES `expense-quotation` (`id`) ON DELETE SET NULL;

ALTER TABLE `expense-invoice`
ADD COLUMN `taxStampId` INT NULL,
ADD CONSTRAINT `FK_expense-invoice_tax` FOREIGN KEY (`taxStampId`) REFERENCES `tax` (`id`) ON DELETE SET NULL;


ALTER TABLE `expense-invoice_meta_data` 
ADD COLUMN `hasTaxStamp` boolean DEFAULT FALSE;

