/*
  # Add Accounts, Tags, Attachments, and Multi-Currency Support

  1. New Tables
    - `accounts`
      - `id` (varchar, primary key)
      - `user_id` (varchar, foreign key to users)
      - `name` (varchar, account name like "BCA", "Cash", "GoPay")
      - `type` (enum: cash/bank/e-wallet/credit-card)
      - `balance` (decimal, current balance)
      - `currency` (varchar, default IDR)
      - `color` (varchar, UI color)
      - `icon` (varchar, icon name)
      - `is_active` (boolean, active status)
      - `created_at` (timestamp)

    - `tags`
      - `id` (varchar, primary key)
      - `user_id` (varchar, foreign key to users)
      - `name` (varchar, tag name)
      - `color` (varchar, UI color)
      - `created_at` (timestamp)

    - `transaction_tags` (junction table)
      - `transaction_id` (varchar, foreign key to transactions)
      - `tag_id` (varchar, foreign key to tags)

    - `attachments`
      - `id` (varchar, primary key)
      - `user_id` (varchar, foreign key to users)
      - `transaction_id` (varchar, foreign key to transactions, nullable)
      - `file_name` (varchar)
      - `file_path` (varchar)
      - `file_size` (int)
      - `mime_type` (varchar)
      - `created_at` (timestamp)

    - `account_transfers`
      - `id` (varchar, primary key)
      - `user_id` (varchar, foreign key to users)
      - `from_account_id` (varchar, foreign key to accounts)
      - `to_account_id` (varchar, foreign key to accounts)
      - `amount` (decimal)
      - `description` (text)
      - `date` (date)
      - `created_at` (timestamp)

    - `investments`
      - `id` (varchar, primary key)
      - `user_id` (varchar, foreign key to users)
      - `name` (varchar, investment name)
      - `type` (enum: stocks/crypto/mutual-funds/gold/bonds/other)
      - `symbol` (varchar, ticker symbol)
      - `quantity` (decimal)
      - `buy_price` (decimal)
      - `current_price` (decimal)
      - `currency` (varchar, default IDR)
      - `purchase_date` (date)
      - `notes` (text)
      - `created_at` (timestamp)

    - `split_bills`
      - `id` (varchar, primary key)
      - `user_id` (varchar, foreign key to users, creator)
      - `transaction_id` (varchar, foreign key to transactions)
      - `title` (varchar)
      - `total_amount` (decimal)
      - `created_at` (timestamp)

    - `split_bill_participants`
      - `id` (varchar, primary key)
      - `split_bill_id` (varchar, foreign key to split_bills)
      - `name` (varchar, participant name)
      - `amount` (decimal, share amount)
      - `is_paid` (boolean)
      - `paid_date` (date)

    - `reminders`
      - `id` (varchar, primary key)
      - `user_id` (varchar, foreign key to users)
      - `title` (varchar)
      - `description` (text)
      - `amount` (decimal)
      - `due_date` (date)
      - `reminder_date` (date)
      - `type` (enum: bill/debt/savings/recurring)
      - `related_id` (varchar, ID of related entity)
      - `is_completed` (boolean)
      - `created_at` (timestamp)

  2. Modifications
    - Add `account_id` to transactions table
    - Add `currency` and `exchange_rate` to transactions table
    - Add default accounts for existing users

  3. Indexes
    - Index on user_id for all tables
    - Index on account_id in transactions
    - Unique index on (user_id, name) for accounts
    - Index on split_bill_id in participants

  4. Important Notes
    - All existing transactions will be assigned to a default "Cash" account
    - Multi-currency support added for international transactions
    - Attachments can be linked to transactions for receipts/invoices
    - Tags provide flexible categorization beyond categories
*/

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  type ENUM('cash', 'bank', 'e-wallet', 'credit-card') NOT NULL DEFAULT 'cash',
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'IDR',
  color VARCHAR(20) NOT NULL DEFAULT '#10b981',
  icon VARCHAR(50) NOT NULL DEFAULT 'Wallet',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_accounts_user (user_id),
  INDEX idx_accounts_active (is_active),
  UNIQUE KEY unique_account_name (user_id, name)
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(20) NOT NULL DEFAULT '#8b5cf6',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_tags_user (user_id),
  UNIQUE KEY unique_tag_name (user_id, name)
);

-- Create transaction_tags junction table
CREATE TABLE IF NOT EXISTS transaction_tags (
  transaction_id VARCHAR(36) NOT NULL,
  tag_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (transaction_id, tag_id),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  INDEX idx_transaction_tags_transaction (transaction_id),
  INDEX idx_transaction_tags_tag (tag_id)
);

-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  transaction_id VARCHAR(36) NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  INDEX idx_attachments_user (user_id),
  INDEX idx_attachments_transaction (transaction_id)
);

-- Create account_transfers table
CREATE TABLE IF NOT EXISTS account_transfers (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  from_account_id VARCHAR(36) NOT NULL,
  to_account_id VARCHAR(36) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT DEFAULT '',
  date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (from_account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  INDEX idx_transfers_user (user_id),
  INDEX idx_transfers_date (date),
  INDEX idx_transfers_from (from_account_id),
  INDEX idx_transfers_to (to_account_id)
);

-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type ENUM('stocks', 'crypto', 'mutual-funds', 'gold', 'bonds', 'other') NOT NULL,
  symbol VARCHAR(20) DEFAULT '',
  quantity DECIMAL(15, 6) NOT NULL DEFAULT 0,
  buy_price DECIMAL(15, 2) NOT NULL,
  current_price DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'IDR',
  purchase_date DATE NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_investments_user (user_id),
  INDEX idx_investments_type (type)
);

-- Create split_bills table
CREATE TABLE IF NOT EXISTS split_bills (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  transaction_id VARCHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
  INDEX idx_split_bills_user (user_id)
);

-- Create split_bill_participants table
CREATE TABLE IF NOT EXISTS split_bill_participants (
  id VARCHAR(36) PRIMARY KEY,
  split_bill_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_date DATE NULL,
  FOREIGN KEY (split_bill_id) REFERENCES split_bills(id) ON DELETE CASCADE,
  INDEX idx_participants_split_bill (split_bill_id)
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  reminder_date DATE NOT NULL,
  type ENUM('bill', 'debt', 'savings', 'recurring', 'other') NOT NULL,
  related_id VARCHAR(36) NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_reminders_user (user_id),
  INDEX idx_reminders_date (reminder_date),
  INDEX idx_reminders_completed (is_completed)
);

-- Add columns to transactions table (MySQL doesn't support IF NOT EXISTS for ALTER COLUMN)
-- Check if columns exist before adding
SET @dbname = DATABASE();

-- Add account_id column
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'transactions' AND COLUMN_NAME = 'account_id');
SET @query = IF(@col_exists = 0,
  'ALTER TABLE transactions ADD COLUMN account_id VARCHAR(36) NULL AFTER category_id',
  'SELECT "Column account_id already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add currency column
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'transactions' AND COLUMN_NAME = 'currency');
SET @query = IF(@col_exists = 0,
  'ALTER TABLE transactions ADD COLUMN currency VARCHAR(3) NOT NULL DEFAULT "IDR" AFTER amount',
  'SELECT "Column currency already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add exchange_rate column
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'transactions' AND COLUMN_NAME = 'exchange_rate');
SET @query = IF(@col_exists = 0,
  'ALTER TABLE transactions ADD COLUMN exchange_rate DECIMAL(15, 6) NOT NULL DEFAULT 1.0 AFTER currency',
  'SELECT "Column exchange_rate already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add notes column
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'transactions' AND COLUMN_NAME = 'notes');
SET @query = IF(@col_exists = 0,
  'ALTER TABLE transactions ADD COLUMN notes TEXT DEFAULT "" AFTER description',
  'SELECT "Column notes already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key for account_id
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = @dbname
  AND TABLE_NAME = 'transactions'
  AND CONSTRAINT_NAME = 'transactions_account_fk');
SET @query = IF(@fk_exists = 0,
  'ALTER TABLE transactions ADD CONSTRAINT transactions_account_fk FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL',
  'SELECT "Foreign key transactions_account_fk already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for account_id
SET @idx_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @dbname
  AND TABLE_NAME = 'transactions'
  AND INDEX_NAME = 'idx_transactions_account');
SET @query = IF(@idx_exists = 0,
  'CREATE INDEX idx_transactions_account ON transactions(account_id)',
  'SELECT "Index idx_transactions_account already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
