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
      [`${entityName}.module.ts`]: '',
      controllers: {
        [`${entityName}.controller.ts`]: '',
        dtos: {
          [`create.dto.ts`]: '',
          [`update.dto.ts`]: '',
        },
      },
      infraestructure: {
        'external-services': {
          http: {
            [`external-${entityName}.service.ts`]: '',
          },
          tokens: {
            [`repository.token.ts`]: '',
          },
        },
      },
      interfaces: {
        [`${singularName}.interface.ts`]: '',
      },
      services: {
        [`${entityName}.service.ts`]: '',
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
