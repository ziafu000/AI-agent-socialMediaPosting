CREATE TABLE IF NOT EXISTS customers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  company_name VARCHAR(255),
  industry VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS brand_profiles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT UNSIGNED NOT NULL,
  brand_name VARCHAR(255) NOT NULL,
  target_audience TEXT,
  brand_voice TEXT,
  products_services TEXT,
  default_cta TEXT,
  words_to_use TEXT,
  words_to_avoid TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS posts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT UNSIGNED NOT NULL,
  platform VARCHAR(50) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  caption TEXT,
  hashtags TEXT,
  status ENUM('draft', 'needs_review', 'approved', 'scheduled', 'publishing', 'published', 'failed', 'cancelled') DEFAULT 'draft',
  scheduled_at DATETIME NULL,
  published_at DATETIME NULL,
  external_post_id VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workflow_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  workflow_name VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  status ENUM('success', 'failed') NOT NULL,
  input_payload JSON NULL,
  output_payload JSON NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


