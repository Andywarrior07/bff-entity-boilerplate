#!/usr/bin/env node

import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as path from 'path';

// Convierte nombres con guiones a PascalCase
const toPascalCase = (word: string) =>
  word
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

const isPlural = (word: string) => word.endsWith('s');

const getSingularName = (word: string) => (isPlural(word) ? word.slice(0, -1) : word);

const createStructure = async (basePath: string, entityName: string) => {
  const singularName = getSingularName(entityName);
  const entityPascal = toPascalCase(entityName);
  const singularPascal = toPascalCase(singularName);

  const structure = {
    [`${entityName}`]: {
      [`${entityName}.module.ts`]: `import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ${entityPascal}Service } from './services/${entityName}.service';
import { ${entityPascal}Controller } from './controllers/${entityName}.controller';
import { ${entityName.toUpperCase().replace(/-/g, '_')}_PORT } from './infrastructure/external-services/tokens/repository.token';

@Module({
  imports: [HttpModule],
  controllers: [${entityPascal}Controller],
  providers: [
    ${entityPascal}Service,
    {
      provide: ${entityName.toUpperCase().replace(/-/g, '_')}_PORT,
      useClass: External${entityPascal}Service,
    }
  ],
})
export class ${entityPascal}Module {}
`,
      controllers: {
        [`${entityName}.controller.ts`]: `import { Controller } from '@nestjs/common';
import { ${entityPascal}Service } from '../services/${entityName}.service';

@Controller('${entityName}')
export class ${entityPascal}Controller {
  constructor(private readonly service: ${entityPascal}Service) {}
}
`,
        dtos: {
          [`create.dto.ts`]: `export class Create${singularPascal}Dto {}
`,
          [`update.dto.ts`]: `import { PartialType } from '@nestjs/mapped-types';
import { Create${singularPascal}Dto } from './create.dto';

export class Update${singularPascal}Dto extends PartialType(Create${singularPascal}Dto) {}
`,
        },
      },
      infrastructure: {
        'external-services': {
          http: {
            [`external-${entityName}.service.ts`]: `import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type { ${singularPascal}Entity, ${singularPascal} } from '../interfaces/${singularName}.interface';

@Injectable()
export class External${entityPascal}Service {
  constructor(
      private readonly http: HttpService,
      private readonly configService: ConfigService,
  ) {}
}
`,
          },
          tokens: {
            [`repository.token.ts`]: `export const ${entityName.toUpperCase().replace(/-/g, '_')}_PORT = Symbol('${entityName.toUpperCase().replace(/-/g, '_')}_PORT');
`,
          },
        },
      },
      interfaces: {
        [`${singularName}.interface.ts`]: `export interface ${singularPascal} {}

export interface ${singularPascal}Entity extends ${singularPascal} {}
`,
      },
      services: {
        [`${entityName}.service.ts`]: `import { Inject, Injectable } from '@nestjs/common';
import { Create${singularPascal}Dto } from '../controllers/dtos/create.dto';
import { Update${singularPascal}Dto } from '../controllers/dtos/update.dto';
import { ${entityName.toUpperCase().replace(/-/g, '_')}_PORT } from './infrastructure/external-services/tokens/repository.token';
import type { ${singularPascal}Entity, ${singularPascal} } from '../interfaces/${singularName}.interface';

@Injectable()
export class ${entityPascal}Service {
  constructor(
    @Inject(${entityName.toUpperCase().replace(/-/g, '_')}_PORT)
    private readonly externalService: External${entityPascal}Service<${singularPascal}Entity, ${singularPascal}>,
  ) {}
}
`,
      },
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
  if (args.length !== 1) {
    console.error('Usage: create-structure <entity-name>');
    process.exit(1);
  }

  const entityName = args[0];
  const basePath = fs.existsSync('./src') ? './src' : '.';

  try {
    console.log(`Generating structure for "${entityName}" inside ${basePath}...`);
    await createStructure(basePath, entityName);
    console.log('Structure generated successfully!');
  } catch (err) {
    console.error('Error generating structure:', err);
  }
};

main();
