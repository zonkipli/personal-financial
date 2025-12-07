/*
  # Personal Finance App - Complete Database Schema

  1. Tables Created
    - `users` - User accounts with authentication
    - `categories` - Income and expense categories
    - `transactions` - Financial transactions
    - `budgets` - Budget limits per category
    - `debts` - Receivables and payables tracking
    - `savings_goals` - Savings targets with progress tracking
    - `recurring_transactions` - Automated recurring transactions
    - `accounts` - Bank accounts, wallets, e-wallets
    - `tags` - Flexible tagging system
    - `transaction_tags` - Many-to-many relationship for tags
    - `attachments` - File attachments for receipts
    - `account_transfers` - Money transfers between accounts
    - `investments` - Investment portfolio tracking
    - `split_bills` - Bill splitting feature
    - `split_bill_participants` - Participants in split bills
    - `reminders` - Payment and bill reminders

  2. Security
    - Row Level Security (RLS) enabled on all tables
    - Policies for authenticated users to access only their own data
    - Admin access policies where appropriate

  3. Key Features
    - Multi-currency support
    - Account-based transaction tracking
    - Investment portfolio management
    - Bill splitting functionality
    - Recurring transactions automation
    - File attachments for receipts
    - Flexible tagging system
    - Comprehensive reminder system
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  color text NOT NULL DEFAULT '#6366f1',
  icon text NOT NULL DEFAULT 'CircleDollarSign',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('cash', 'bank', 'e-wallet', 'credit-card')) DEFAULT 'cash',
  balance numeric(15, 2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'IDR',
  color text NOT NULL DEFAULT '#10b981',
  icon text NOT NULL DEFAULT 'Wallet',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_active ON accounts(is_active);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  account_id uuid REFERENCES accounts(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount numeric(15, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'IDR',
  exchange_rate numeric(15, 6) NOT NULL DEFAULT 1.0,
  description text DEFAULT '',
  notes text DEFAULT '',
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  amount numeric(15, 2) NOT NULL,
  month smallint NOT NULL CHECK (month >= 1 AND month <= 12),
  year smallint NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, category_id, month, year)
);

CREATE INDEX IF NOT EXISTS idx_budgets_user ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets(month, year);

-- Debts table
CREATE TABLE IF NOT EXISTS debts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('receivable', 'payable')),
  person_name text NOT NULL,
  amount numeric(15, 2) NOT NULL,
  description text DEFAULT '',
  due_date date,
  is_paid boolean DEFAULT false,
  paid_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_debts_user ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_type ON debts(type);
CREATE INDEX IF NOT EXISTS idx_debts_paid ON debts(is_paid);

-- Savings goals table
CREATE TABLE IF NOT EXISTS savings_goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  target_amount numeric(15, 2) NOT NULL DEFAULT 0,
  current_amount numeric(15, 2) NOT NULL DEFAULT 0,
  deadline date,
  description text DEFAULT '',
  is_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_savings_user ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_completed ON savings_goals(is_completed);

-- Recurring transactions table
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount numeric(15, 2) NOT NULL,
  description text DEFAULT '',
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  start_date date NOT NULL,
  end_date date,
  is_active boolean NOT NULL DEFAULT true,
  last_processed date,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recurring_user ON recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_active ON recurring_transactions(is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_last_processed ON recurring_transactions(last_processed);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#8b5cf6',
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_tags_user ON tags(user_id);

-- Transaction tags junction table
CREATE TABLE IF NOT EXISTS transaction_tags (
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (transaction_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_transaction_tags_transaction ON transaction_tags(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_tags_tag ON transaction_tags(tag_id);

-- Attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attachments_user ON attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_attachments_transaction ON attachments(transaction_id);

-- Account transfers table
CREATE TABLE IF NOT EXISTS account_transfers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  to_account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  amount numeric(15, 2) NOT NULL,
  description text DEFAULT '',
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transfers_user ON account_transfers(user_id);
CREATE INDEX IF NOT EXISTS idx_transfers_date ON account_transfers(date);
CREATE INDEX IF NOT EXISTS idx_transfers_from ON account_transfers(from_account_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to ON account_transfers(to_account_id);

-- Investments table
CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('stocks', 'crypto', 'mutual-funds', 'gold', 'bonds', 'other')),
  symbol text DEFAULT '',
  quantity numeric(15, 6) NOT NULL DEFAULT 0,
  buy_price numeric(15, 2) NOT NULL,
  current_price numeric(15, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'IDR',
  purchase_date date NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_investments_user ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_type ON investments(type);

-- Split bills table
CREATE TABLE IF NOT EXISTS split_bills (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES transactions(id) ON DELETE SET NULL,
  title text NOT NULL,
  total_amount numeric(15, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_split_bills_user ON split_bills(user_id);

-- Split bill participants table
CREATE TABLE IF NOT EXISTS split_bill_participants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  split_bill_id uuid NOT NULL REFERENCES split_bills(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric(15, 2) NOT NULL,
  is_paid boolean NOT NULL DEFAULT false,
  paid_date date
);

CREATE INDEX IF NOT EXISTS idx_participants_split_bill ON split_bill_participants(split_bill_id);

-- Reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  amount numeric(15, 2) NOT NULL DEFAULT 0,
  due_date date NOT NULL,
  reminder_date date NOT NULL,
  type text NOT NULL CHECK (type IN ('bill', 'debt', 'savings', 'recurring', 'other')),
  related_id uuid,
  is_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_reminders_completed ON reminders(is_completed);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_bill_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- RLS Policies for categories table
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- RLS Policies for accounts table
CREATE POLICY "Users can view own accounts"
  ON accounts FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert own accounts"
  ON accounts FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update own accounts"
  ON accounts FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can delete own accounts"
  ON accounts FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- RLS Policies for transactions table
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- RLS Policies for budgets table
CREATE POLICY "Users can view own budgets"
  ON budgets FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert own budgets"
  ON budgets FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update own budgets"
  ON budgets FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can delete own budgets"
  ON budgets FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- RLS Policies for debts table
CREATE POLICY "Users can view own debts"
  ON debts FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert own debts"
  ON debts FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update own debts"
  ON debts FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can delete own debts"
  ON debts FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- RLS Policies for savings_goals table
CREATE POLICY "Users can view own savings goals"
  ON savings_goals FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert own savings goals"
  ON savings_goals FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update own savings goals"
  ON savings_goals FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can delete own savings goals"
  ON savings_goals FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- RLS Policies for recurring_transactions table
CREATE POLICY "Users can view own recurring transactions"
  ON recurring_transactions FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert own recurring transactions"
  ON recurring_transactions FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update own recurring transactions"
  ON recurring_transactions FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can delete own recurring transactions"
  ON recurring_transactions FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- RLS Policies for tags table
CREATE POLICY "Users can view own tags"
  ON tags FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert own tags"
  ON tags FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update own tags"
  ON tags FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can delete own tags"
  ON tags FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- RLS Policies for transaction_tags table
CREATE POLICY "Users can view own transaction tags"
  ON transaction_tags FOR SELECT
  USING (transaction_id IN (SELECT id FROM transactions WHERE user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')));

CREATE POLICY "Users can insert own transaction tags"
  ON transaction_tags FOR INSERT
  WITH CHECK (transaction_id IN (SELECT id FROM transactions WHERE user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')));

CREATE POLICY "Users can delete own transaction tags"
  ON transaction_tags FOR DELETE
  USING (transaction_id IN (SELECT id FROM transactions WHERE user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')));

-- RLS Policies for attachments table
CREATE POLICY "Users can view own attachments"
  ON attachments FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert own attachments"
  ON attachments FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can delete own attachments"
  ON attachments FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- RLS Policies for account_transfers table
CREATE POLICY "Users can view own transfers"
  ON account_transfers FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert own transfers"
  ON account_transfers FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can delete own transfers"
  ON account_transfers FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- RLS Policies for investments table
CREATE POLICY "Users can view own investments"
  ON investments FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert own investments"
  ON investments FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update own investments"
  ON investments FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can delete own investments"
  ON investments FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- RLS Policies for split_bills table
CREATE POLICY "Users can view own split bills"
  ON split_bills FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert own split bills"
  ON split_bills FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update own split bills"
  ON split_bills FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can delete own split bills"
  ON split_bills FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- RLS Policies for split_bill_participants table
CREATE POLICY "Users can view own split bill participants"
  ON split_bill_participants FOR SELECT
  USING (split_bill_id IN (SELECT id FROM split_bills WHERE user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')));

CREATE POLICY "Users can insert own split bill participants"
  ON split_bill_participants FOR INSERT
  WITH CHECK (split_bill_id IN (SELECT id FROM split_bills WHERE user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')));

CREATE POLICY "Users can update own split bill participants"
  ON split_bill_participants FOR UPDATE
  USING (split_bill_id IN (SELECT id FROM split_bills WHERE user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')));

CREATE POLICY "Users can delete own split bill participants"
  ON split_bill_participants FOR DELETE
  USING (split_bill_id IN (SELECT id FROM split_bills WHERE user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')));

-- RLS Policies for reminders table
CREATE POLICY "Users can view own reminders"
  ON reminders FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert own reminders"
  ON reminders FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update own reminders"
  ON reminders FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can delete own reminders"
  ON reminders FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));
