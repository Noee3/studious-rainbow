CREATE or REPLACE TABLE assets (
    address VARCHAR PRIMARY KEY,
    decimals INTEGER NOT NULL,
    name VARCHAR,
    symbol VARCHAR,
    created_at BIGINT,
    last_updated BIGINT
);

CREATE or REPLACE TABLE asset_prices (
    asset_address VARCHAR,
    price_base_currency VARCHAR,
    timestamp BIGINT,
    FOREIGN KEY (asset_address) REFERENCES assets(address),
    PRIMARY KEY (asset_address, timestamp)
);

CREATE or REPLACE TABLE emode_categories (
    id INTEGER PRIMARY KEY,
    ltv INTEGER,
    liquidation_threshold INTEGER,
    liquidation_bonus INTEGER,
    label VARCHAR,
    bitmap BIGINT,
    last_updated BIGINT
);

CREATE or REPLACE TABLE reserves (
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

CREATE OR REPLACE TABLE users (
    address VARCHAR PRIMARY KEY,
    emode_category_id INTEGER DEFAULT NULL,
    created_at BIGINT,
    last_updated BIGINT,
    FOREIGN KEY (emode_category_id) REFERENCES emode_categories(id)
);

CREATE or REPLACE TABLE user_reserves (
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
