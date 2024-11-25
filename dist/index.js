#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
function createFile(filePath) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, '', 'utf8');
}
function createStructure(basePath, name) {
    const singularName = name.slice(0, -1);
    const structure = [
        `${name}/${name}.module.ts`,
        `${name}/controllers/${name}.controller.ts`,
        `${name}/controllers/dtos/create.dto.ts`,
        `${name}/controllers/dtos/update.dto.ts`,
        `${name}/infraestructure/external-services/http/external-${name}.service.ts`,
        `${name}/infraestructure/external-services/tokens/repository.token.ts`,
        `${name}/interfaces/${singularName}.interface.ts`,
        `${name}/services/${name}.service.ts`,
    ];
    structure.forEach(file => {
        const filePath = path.join(basePath, file);
        createFile(filePath);
        console.log(`Created: ${filePath}`);
    });
}
// Main function
function main() {
    const args = process.argv.slice(2);
    if (args.length !== 1) {
        console.error('Usage: create-structure <name>');
        process.exit(1);
    }
    const name = args[0];
    const basePath = process.cwd();
    createStructure(basePath, name);
}
main();
//# sourceMappingURL=index.js.map