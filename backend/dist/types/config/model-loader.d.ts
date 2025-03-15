import { Sequelize, Model } from 'sequelize';
declare module 'sequelize' {
    interface ModelStatic {
        associate?: (models: Record<string, typeof Model>) => void;
    }
}
export declare function loadModels(sequelizeInstance: Sequelize, modelsPath: string): void;
