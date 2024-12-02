
# Create Structure CLI

## Description

`bff-entity` is a CLI tool designed to generate a boilerplate structure for an entity within a **Backend-for-Frontend (BFF)** architecture for **NestJS**. This package automates the creation of directories and files, ensuring consistency and saving development time.

The generated structure includes necessary modules, controllers, services, and interfaces for an entity, following NestJS best practices. Additionally, it supports configurable options and generates boilerplate code automatically.

## Features

- Creates a boilerplate folder structure for an entity.
- Supports singular and plural naming conventions.
- Automatically transforms hyphenated names into **PascalCase** for class and interface names, while maintaining hyphenated file names.
- Configurable options for customization:
    - `--help` or `-h`: Displays a list of commands and their descriptions.
    - `--no-code`: Generates the folder structure without boilerplate code.
- Ensures directories and files are created recursively.
- Ideal for rapid development of BFF services.

## Installation

To use this CLI globally, install it via npm:

```bash
npm install -g bff-entity-boilerplate
```

## Usage

Run the command followed by the name of the entity and any desired options. For example:

```bash
bff-entity <entity-name> [options]
```

### Options

- `--help, -h`: Displays the help menu with all commands and their descriptions.
- `--no-code, -n`: Generates only the folder structure without any boilerplate code.
- `--with-tests, -t`: Generate test files
- `--path, -p <path>`: Specify the base directory (default: ./src)
- `--version, -v`:      Show current version installed
### Example Commands

1. Generate a complete structure with boilerplate code:
   ```bash
   bff-entity attendances
   ```

2. Generate a structure without code:
   ```bash
   bff-entity attendances --no-code
   ```

3. View help menu:
   ```bash
   bff-entity --help
   ```

### Output Example

Running `bff-entity professional-attentions` will generate the following folder and file structure:

```
├── professional-attentions
│   ├── professional-attentions.module.ts
│   ├── controllers
│   │   ├── professional-attentions.controller.ts
│   │   └── dtos
│   │       ├── create.dto.ts
│   │       └── update.dto.ts
│   ├── infrastructure
│   │   └── external-services
│   │       ├── http
│   │       │   └── external-professional-attentions.service.ts
│   │       └── tokens
│   │           └── repository.token.ts
│   ├── interfaces
│   │   └── professional-attention.interface.ts
│   └── services
│       └── professional-attentions.service.ts
```

### Notes

- The CLI automatically generates **PascalCase** class and interface names based on the provided entity name.
- The CLI is executed in the current directory unless a different base path is specified.
- Use the `--no-code` option if you prefer an empty structure for manual coding.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Author

[Andrés Guerrero C.](https://github.com/Andywarrior07)

---

Enjoy faster development and maintainable structures with `bff-entity` 🍻!
