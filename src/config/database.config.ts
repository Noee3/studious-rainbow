import path from 'path';

export interface DatabaseConfig {
    name: string;
    path: string;
    memory?: boolean;
    readOnly?: boolean;
    threads?: number;
}

export const databaseConfig: DatabaseConfig = {
    name: "aave_dev",
    path: path.resolve(process.cwd(), 'src/data', 'aave_dev.bd'),
    readOnly: false,
    threads: 4
};

export const dbConfigs = {
    development: databaseConfig,
    production: {
        ...databaseConfig,
        path: path.resolve(process.cwd(), 'src/data', 'aave_prod.bd'),
        name: 'avve_prod',
    },
};