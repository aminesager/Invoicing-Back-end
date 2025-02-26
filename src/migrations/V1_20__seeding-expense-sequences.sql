ALTER TABLE `app_config`
ADD COLUMN `expense-quotation_sequence` VARCHAR(255),
ADD COLUMN `expense-invoice_sequence` VARCHAR(255);

INSERT INTO `app_config` (`key`, `value`)
VALUES
    (
        'expense-quotation_sequence',
        '{"label": "quotation", "prefix": "QUO", "dynamicSequence": "yyyy-MM", "next": 1}'
    ),
    (
        'expense-invoice_sequence',
        '{"label": "invoice", "prefix": "INV", "dynamicSequence": "yyyy-MM", "next": 1}'
    );
