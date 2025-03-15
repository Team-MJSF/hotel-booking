// This file helps Sequelize CLI work with TypeScript models
import fs from 'fs';
import path from 'path';
import { Sequelize, Model } from 'sequelize';
export function loadModels(sequelizeInstance, modelsPath) {
    // Read all files in the models directory
    const modelFiles = fs.readdirSync(modelsPath)
        .filter(file => {
        return (file.indexOf('.') !== 0 &&
            file !== path.basename(__filename) &&
            (file.endsWith('.ts') || file.endsWith('.js')) &&
            !file.endsWith('.test.ts') &&
            !file.endsWith('.test.js'));
    });
    // Import each model and initialize it
    for (const file of modelFiles) {
        const modelPath = path.join(modelsPath, file);
        // Use dynamic import instead of require for better TypeScript compatibility
        import(modelPath).then(module => {
            const model = module.default;
            if (model && typeof model.init === 'function') {
                model.init(sequelizeInstance);
            }
        }).catch(error => {
            console.error(`Error importing model ${file}:`, error);
        });
    }
    // Set up associations between models
    const models = sequelizeInstance.models;
    Object.keys(models).forEach(modelName => {
        // Extended through Sequelize type declaration merging
        const model = models[modelName];
        if (model.associate) {
            model.associate(models);
        }
    });
}
