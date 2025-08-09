CREATE OR REPLACE TABLE assets (
    address VARCHAR PRIMARY KEY,
    decimals INTEGER NOT NULL,
    name VARCHAR,
    symbol VARCHAR,
    created_at BIGINT,
    last_updated BIGINT
);

CREATE INDEX IF NOT EXISTS idx_assets_address ON assets(address);

CREATE OR REPLACE TABLE asset_prices (
    asset_address VARCHAR,
    price_base_currency VARCHAR,
    timestamp BIGINT,
    FOREIGN KEY (asset_address) REFERENCES assets(address),
    PRIMARY KEY (asset_address, timestamp)
);

CREATE INDEX IF NOT EXISTS idx_asset_prices_asset_address ON asset_prices(asset_address);

CREATE OR REPLACE TABLE emode_categories (
    id INTEGER PRIMARY KEY,
    ltv INTEGER,
    liquidation_threshold INTEGER,
    liquidation_bonus INTEGER,
    label VARCHAR,
    bitmap BIGINT,
    last_updated BIGINT
);

CREATE INDEX IF NOT EXISTS idx_emode_categories_id ON emode_categories(id);

CREATE OR REPLACE TABLE reserves (
    asset_address VARCHAR PRIMARY KEY,
    name VARCHAR,
    symbol VARCHAR,
    decimals INTEGER,
    liquidation_threshold INTEGER,
    liquidity_index VARCHAR,
    variable_borrow_index VARCHAR,
    ltv INTEGER,
    liquidation_bonus INTEGER,
    reserve_factor INTEGER,
    is_active BOOLEAN,
    is_frozen BOOLEAN,
    last_updated BIGINT,
    FOREIGN KEY (asset_address) REFERENCES assets(address)
);

CREATE INDEX IF NOT EXISTS idx_reserves_asset_address ON reserves(asset_address);

CREATE OR REPLACE TABLE users (
    address VARCHAR PRIMARY KEY,
    emode_category_id INTEGER DEFAULT NULL,
    created_at BIGINT,
    last_updated BIGINT,
    FOREIGN KEY (emode_category_id) REFERENCES emode_categories(id)
);

CREATE INDEX IF NOT EXISTS idx_users_address ON users(address);

CREATE OR REPLACE TABLE user_reserves (
    user_address VARCHAR,
    asset_address VARCHAR,
    usage_as_collateral_enabled BOOLEAN DEFAULT false,
    scaled_atoken_balance VARCHAR DEFAULT '0',
    scaled_variable_debt VARCHAR DEFAULT '0',
    last_updated BIGINT,
    FOREIGN KEY (user_address) REFERENCES users(address),
    FOREIGN KEY (asset_address) REFERENCES assets(address),
    PRIMARY KEY (user_address, asset_address)
);

CREATE INDEX IF NOT EXISTS idx_user_reserves_user_address ON user_reserves(user_address);
CREATE INDEX IF NOT EXISTS idx_user_reserves_asset_address ON user_reserves(asset_address);

CREATE OR REPLACE TABLE events (
    event_name VARCHAR,
    contract_address VARCHAR,
    block_number VARCHAR,
    transaction_hash VARCHAR,
    event_args VARCHAR
);