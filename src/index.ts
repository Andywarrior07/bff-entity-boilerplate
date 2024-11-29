#!/usr/bin/env node

import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as path from 'path';

const isPlural = (word: string) => word.endsWith('s');

const getSingularName = (word: string) => (isPlural(word) ? word.slice(0, -1) : word);

const createStructure = async (basePath: string, entityName: string) => {
  const singularName = getSingularName(entityName);

  const structure = {
    [`${entityName}`]: {
      [`${entityName}.module.ts`]: `import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}Service } from './services/${entityName}.service';
import { ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}Controller } from './controllers/${entityName}.controller';
import { ${entityName.toUpperCase()}_PORT } from './infrastructure/external-services/tokens/repository.token';

@Module({
  imports: [HttpModule],
  controllers: [${entityName.charAt(0).toUpperCase() + entityName.slice(1)}Controller],
  providers: [
    ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}Service,
    {
      provide: ${entityName.toUpperCase()}_PORT,
      useClass: External${entityName.charAt(0).toUpperCase() + entityName.slice(1)}Service,
    }
  ],
})
export class ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}Module {}
`,
      controllers: {
        [`${entityName}.controller.ts`]: `import { Controller} from '@nestjs/common';
import { ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}Service } from '../services/${entityName}.service';

@Controller('${entityName}')
export class ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}Controller {
  constructor(private readonly service: ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}Service) {}
}
`,
        dtos: {
          [`create.dto.ts`]: `export class Create${entityName.charAt(0).toUpperCase() + entityName.slice(1)}Dto {}
`,
          [`update.dto.ts`]: `import { PartialType } from '@nestjs/mapped-types';
import { Create${entityName.charAt(0).toUpperCase() + entityName.slice(1)}Dto } from './create.dto';

export class Update${entityName.charAt(0).toUpperCase() + entityName.slice(1)}Dto extends PartialType(Create${entityName.charAt(0).toUpperCase() + entityName.slice(1)}Dto){}
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
import type { ${singularName.charAt(0).toUpperCase() + singularName.slice(1)}Entity, ${singularName.charAt(0).toUpperCase() + singularName.slice(1)}, ${singularName.charAt(0).toUpperCase() + singularName.slice(1)} } from '../interfaces/${singularName}.interface';

@Injectable()
export class External${entityName.charAt(0).toUpperCase() + entityName.slice(1)}Service implements ExternalService<${singularName.charAt(0).toUpperCase() + singularName.slice(1)}Entity, ${singularName.charAt(0).toUpperCase() + singularName.slice(1)}>{
  constructor(
      private readonly http: HttpService,
      private readonly configService: ConfigService,
  ) {}
}
`,
          },
          tokens: {
            [`repository.token.ts`]: `export const ${entityName.toUpperCase()}_PORT = Symbol('${entityName.toUpperCase()}_PORT');
`,
          },
        },
      },
      interfaces: {
        [`${singularName}.interface.ts`]: `export interface ${singularName.charAt(0).toUpperCase() + singularName.slice(1)} {}

export interface ${singularName.charAt(0).toUpperCase() + singularName.slice(1)}Entity extends ${singularName.charAt(0).toUpperCase() + singularName.slice(1)} {}
`,
      },
      services: {
        [`${entityName}.service.ts`]: `import { Inject, Injectable } from '@nestjs/common';
import { Create${entityName.charAt(0).toUpperCase() + entityName.slice(1)}Dto } from '../controllers/dtos/create.dto';
import { Update${entityName.charAt(0).toUpperCase() + entityName.slice(1)}Dto } from '../controllers/dtos/update.dto';
import type { ${singularName.charAt(0).toUpperCase() + singularName.slice(1)}Entity, ${singularName.charAt(0).toUpperCase() + singularName.slice(1)}} from '../interfaces/${singularName}.interface';

@Injectable()
export class ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}Service {
  constructor(
    @Inject(${entityName.toUpperCase()}_PORT)
    private readonly externalService: External${entityName.charAt(0).toUpperCase() + entityName.slice(1)}Service<${singularName.charAt(0).toUpperCase() + singularName.slice(1)}Entity, ${singularName.charAt(0).toUpperCase() + singularName.slice(1)}>,
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
