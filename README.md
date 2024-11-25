
# Create Structure CLI

## Description

`bff-entity` is a CLI tool designed to generate a boilerplate structure for an entity within a **Backend-for-Frontend (BFF)** architecture for **NestJS**. This package automates the creation of directories and files, ensuring consistency and saving development time.

The generated structure includes necessary modules, controllers, services, and interfaces for an entity, following NestJS best practices.

## Features

- Creates a boilerplate folder structure for an entity.
- Supports singular and plural naming conventions.
- Ensures directories and files are created recursively.
- Ideal for rapid development of BFF services.

## Installation

To use this CLI globally, install it via npm:

```bash
npm install -g bff-entity
```

## Usage

Run the command followed by the name of the entity. For example:

```bash
bff-entity <entity-name>
```

Replace `<entity-name>` with the plural name of the entity. For example:

```bash
bff-entity attendances
```

### Output Example

Running `bff-entity attendances` will generate the following folder and file structure:

```
├── attendances
│   ├── attendances.module.ts
│   ├── controllers
│   │   ├── attendances.controller.ts
│   │   └── dtos
│   │       ├── create.dto.ts
│   │       └── update.dto.ts
│   ├── infraestructure
│   │   └── external-services
│   │       ├── http
│   │       │   └── external-attendances.service.ts
│   │       └── tokens
│   │           └── repository.token.ts
│   ├── interfaces
│   │   └── attendance.interface.ts
│   └── services
│       └── attendances.service.ts
```

### Notes

- The CLI generates **empty files** with proper naming conventions.
- Ensure the CLI is executed in the desired base directory.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Author

[Andrés Guerrero C.](https://github.com/Andywarrior07)

---

Enjoy faster development and maintainable structures with `bff-entity`!
