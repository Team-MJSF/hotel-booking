import { Sequelize } from 'sequelize';
export declare const sequelize: Sequelize;
export declare const initializeDatabase: () => Promise<boolean>;
export default sequelize;
