-- Create tables for Personal Finance App
-- Run this script first to set up the database schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  color VARCHAR(20) NOT NULL DEFAULT '#6366f1',
  icon VARCHAR(50) NOT NULL DEFAULT 'CircleDollarSign',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_categories_user (user_id),
  INDEX idx_categories_type (type)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  category_id VARCHAR(36) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  INDEX idx_transactions_user (user_id),
  INDEX idx_transactions_date (date),
  INDEX idx_transactions_type (type)
);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  category_id VARCHAR(36) NULL,
  amount DECIMAL(15, 2) NOT NULL,
  month TINYINT NOT NULL,
  year SMALLINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_budgets_user (user_id),
  INDEX idx_budgets_period (month, year),
  UNIQUE KEY unique_budget (user_id, category_id, month, year)
);

-- Debts table
CREATE TABLE IF NOT EXISTS debts (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('receivable', 'payable') NOT NULL,
  person_name VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  due_date DATE NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  paid_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_debts_user (user_id),
  INDEX idx_debts_type (type),
  INDEX idx_debts_paid (is_paid)
);
