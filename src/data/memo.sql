
CREATE TABLE ducks as SELECT 3 AS age, 'mandarin' AS breed;
SELECT 'hello' as message;

duckdb duuck.db
INSTALL ducklake; -- This line installs the ducklake extension
LOAD ducklake; -- This line loads the ducklake extension
FROM duckdb_extensions(); -- List all installed extensions
FROM duckdb_settings(); -- List all settings
SHOW ALL TABLES; -- List all tables in the database
SHOW DATABASES; -- List all databases
FROM ducks; -- Select all data from the ducks table
.timer on --get time used for executing after each query 
SELECT COUNT(*) FROM ducks; -- Count the number of rows in the ducks table
SELECT 'hello' as message; -- Select a message to display

CREATE or REPLACE TABLE reservesTest (
    decimals BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE or REPLACE TABLE reserves (
            -- Asset de base
            underlying_asset VARCHAR PRIMARY KEY,    -- Address
            name VARCHAR NOT NULL,
            symbol VARCHAR NOT NULL,
            decimals BIGINT NOT NULL,

            -- Configuration collatéral (basis points)
            base_ltv_as_collateral BIGINT,          -- 6000 = 60%
            reserve_liquidation_threshold BIGINT,   -- 6500 = 65% 
            reserve_liquidation_bonus BIGINT,       -- 11000 = 110%
            reserve_factor BIGINT,                  -- 2000 = 20%

            -- États booléens
            usage_as_collateral_enabled BOOLEAN,
            borrowing_enabled BOOLEAN,
            is_active BOOLEAN,
            is_frozen BOOLEAN,

            -- Index et taux (RAY - 27 décimales)
            liquidity_index VARCHAR,                 -- currentBalance
            variable_borrow_index VARCHAR,           -- currentDebt  
            liquidity_rate VARCHAR,                  -- Rendement annuel
            variable_borrow_rate VARCHAR,            -- Taux emprunt

            -- Timestamp
            last_update_timestamp BIGINT,           -- Unix timestamp

            -- Adresses tokens
            a_token_address VARCHAR,
            variable_debt_token_address VARCHAR,
            interest_rate_strategy_address VARCHAR,

            -- Liquidité et dette
            available_liquidity VARCHAR,             -- En unités token
            total_scaled_variable_debt VARCHAR,      -- Dette scaled

            -- Prix et oracle  
            price_in_market_reference_currency VARCHAR, -- Prix devise ref
            price_oracle VARCHAR,                    -- Adresse oracle

            -- -- Stratégie taux (RAY)
            -- variable_rate_slope1 BIGINT,
            -- variable_rate_slope2 BIGINT,
            -- base_variable_borrow_rate BIGINT,
            -- optimal_usage_ratio BIGINT,

            -- -- États avancés
            -- is_paused BOOLEAN,
            -- is_siloed_borrowing BOOLEAN,

            -- -- Données financières
            -- accrued_to_treasury BIGINT,
            -- unbacked BIGINT,
            -- isolation_mode_total_debt BIGINT,

            -- -- Flash loans et plafonds
            -- flash_loan_enabled BOOLEAN,
            -- debt_ceiling BIGINT,
            -- debt_ceiling_decimals BIGINT,
            -- borrow_cap BIGINT,
            -- supply_cap BIGINT,

            -- -- Autres
            -- borrowable_in_isolation BOOLEAN,
            -- virtual_acc_active BOOLEAN,
            -- virtual_underlying_balance BIGINT,

            -- Métadonnées
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
);