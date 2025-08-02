export interface DatabaseConfig {
    name: string;
    path: string;
    memory?: boolean;
    readOnly?: boolean;
    threads?: number;
}

export const databaseConfig: DatabaseConfig = {
    name: "aave_base",
    path: '../data/aave_base.db',
    readOnly: false,
    threads: 4
};

export const dbConfigs = {
    development: databaseConfig,
    production: {
        ...databaseConfig,
        path: databaseConfig.path + databaseConfig.name
    },
};