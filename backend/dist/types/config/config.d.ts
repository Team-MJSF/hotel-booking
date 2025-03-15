interface DatabaseConfig {
    username: string | undefined;
    password: string | undefined;
    database: string;
    host: string | undefined;
    dialect: 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql';
}
interface Config {
    development: DatabaseConfig;
    test: DatabaseConfig;
    production: DatabaseConfig;
    [key: string]: DatabaseConfig;
}
declare const config: Config;
export default config;
