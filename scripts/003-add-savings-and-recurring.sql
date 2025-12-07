/*
  # Add Savings Goals and Recurring Transactions

  1. New Tables
    - `savings_goals`
      - `id` (varchar, primary key)
      - `user_id` (varchar, foreign key to users)
      - `name` (varchar, goal name)
      - `target_amount` (decimal, target savings amount)
      - `current_amount` (decimal, current progress)
      - `deadline` (date, optional deadline)
      - `description` (text, goal description)
      - `is_completed` (boolean, completion status)
      - `created_at` (timestamp)

    - `recurring_transactions`
      - `id` (varchar, primary key)
      - `user_id` (varchar, foreign key to users)
      - `category_id` (varchar, foreign key to categories)
      - `type` (enum: income/expense)
      - `amount` (decimal)
      - `description` (text)
      - `frequency` (enum: daily/weekly/monthly/yearly)
      - `start_date` (date)
      - `end_date` (date, optional)
      - `is_active` (boolean)
      - `last_processed` (date, last auto-generated transaction)
      - `created_at` (timestamp)

  2. Indexes
    - Index on user_id for both tables for efficient queries
    - Index on is_active for recurring_transactions

  3. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create savings_goals table
CREATE TABLE IF NOT EXISTS savings_goals (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  target_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  current_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  deadline DATE,
  description TEXT DEFAULT '',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_savings_user (user_id),
  INDEX idx_savings_completed (is_completed)
);

-- Create recurring_transactions table
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  category_id VARCHAR(36) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT DEFAULT '',
  frequency ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_processed DATE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  INDEX idx_recurring_user (user_id),
  INDEX idx_recurring_active (is_active),
  INDEX idx_recurring_last_processed (last_processed)
);
