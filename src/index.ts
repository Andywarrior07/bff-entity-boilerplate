#!/usr/bin/env node

import * as fse from 'fs-extra';
import * as path from 'path';

const isPlural = (word: string) => word.endsWith('s');
const getSingularName = (word: string) => (isPlural(word) ? word.slice(0, -1) : word);
const toPascalCase = (word: string) => word.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');

const createStructure = async (
  basePath: string,
  entityName: string,
  options: { code: boolean; tests: boolean }
) => {
  const singularName = getSingularName(entityName);
  const pascalCaseEntity = toPascalCase(entityName);
  const structure = {
    [`${entityName}`]: {
      [`${entityName}.module.ts`]: options.code
        ? `import { Module } from '@nestjs/common';
import { ${pascalCaseEntity}Service } from './services/${entityName}.service';
import { ${pascalCaseEntity}Controller } from './controllers/${entityName}.controller';

@Module({
  controllers: [${pascalCaseEntity}Controller],
  providers: [${pascalCaseEntity}Service],
})
export class ${pascalCaseEntity}Module {}
`
        : '',
      controllers: {
        [`${entityName}.controller.ts`]: options.code
          ? `import { Controller } from '@nestjs/common';
import { ${pascalCaseEntity}Service } from '../services/${entityName}.service';

@Controller('${entityName}')
export class ${pascalCaseEntity}Controller {
  constructor(private readonly service: ${pascalCaseEntity}Service) {}
}
`
          : '',
        dtos: {
          [`create.dto.ts`]: options.code ? `export class Create${pascalCaseEntity}Dto {}` : '',
          [`update.dto.ts`]: options.code
            ? `import { PartialType } from '@nestjs/mapped-types';
import { Create${pascalCaseEntity}Dto } from './create.dto';

export class Update${pascalCaseEntity}Dto extends PartialType(Create${pascalCaseEntity}Dto) {}
`
            : '',
        },
      },
      services: {
        [`${entityName}.service.ts`]: options.code
          ? `import { Injectable } from '@nestjs/common';

@Injectable()
export class ${pascalCaseEntity}Service {}
`
          : '',
      },
      interfaces: {
        [`${singularName}.interface.ts`]: options.code
          ? `export interface ${toPascalCase(singularName)} {}

export interface ${toPascalCase(singularName)}Entity extends ${toPascalCase(singularName)} {}
`
          : '',
      },
      ...(options.tests && {
        tests: {
          [`${entityName}.controller.spec.ts`]: `import { Test, TestingModule } from '@nestjs/testing';
import { ${pascalCaseEntity}Controller } from './${entityName}.controller';

describe('${pascalCaseEntity}Controller', () => {
  let controller: ${pascalCaseEntity}Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [${pascalCaseEntity}Controller],
    }).compile();

    controller = module.get<${pascalCaseEntity}Controller>(${pascalCaseEntity}Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
`,
        },
      }),
    },
  };

  const createFiles = async (currentPath: string, obj: any) => {
    for (const [key, value] of Object.entries(obj)) {
      const newPath = path.join(currentPath, key);
      if (typeof value === 'string') {
        await fse.outputFile(newPath, value);
      } else {
        await fse.ensureDir(newPath);
        await createFiles(newPath, value);
      }
    }
  };

  await createFiles(basePath, structure);
};

const main = async () => {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: bff-entity <entity-name> [options]

Options:
  --help, -h         Show help
  --no-code, -n      Create the structure without code in files
  --with-tests, -t   Generate test files
  --path, -p <path>  Specify the base directory (default: ./src)
`);
    return;
  }

  const options: { code: boolean; tests: boolean; path: string } = {
    code: true,
    tests: false,
    path: './src',
  };

  // Procesar argumentos
  const entityName = args.find(arg => !arg.startsWith('-'));
  if (!entityName) {
    console.error('Usage: bff-entity <entity-name> [options]');
    process.exit(1);
  }

  options.code = !args.includes('--no-code') && !args.includes('-n');
  options.tests = args.includes('--with-tests') || args.includes('-t');

  const pathIndex = args.findIndex(arg => arg === '--path' || arg === '-p');
  if (pathIndex !== -1 && args[pathIndex + 1]) {
    options.path = args[pathIndex + 1];
  }

  try {
    console.log(`Generating structure for "${entityName}" in ${options.path}...`);
    await createStructure(options.path, entityName, options);
    console.log('Structure generated successfully!');
  } catch (err) {
    console.error('Error generating structure:', err);
  }
};

main();
