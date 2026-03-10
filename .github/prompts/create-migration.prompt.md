---
description: "Create a TypeORM migration for the trac-portal-api project. Use when you need to add tables, columns, indexes, or modify database schema."
agent: "nestjs-api"
---

Create a TypeORM migration in `trac-portal-api/src/migrations/`.

## Requirements

- Name the file: `{timestamp}-{PascalCaseDescription}.ts` (e.g., `1770500000000-AddStatusToNets.ts`)
- Class name: `{PascalCaseDescription}{Timestamp}` (e.g., `AddStatusToNets1770500000000`)
- Set `name` property to match class name
- Implement BOTH `up()` and `down()` methods — `down()` must fully reverse `up()`
- Use `queryRunner.query()` for raw SQL or TypeORM Table/Column APIs

## Migration Template

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrationName1234567890 implements MigrationInterface {
  name = 'MigrationName1234567890';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Apply changes
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse changes
  }
}
```

## Checklist

1. If adding a column to an existing table, check the entity file to understand existing columns
2. If creating a new table, include `id` (uuid, primary), `createdAt`, `updatedAt`, `createdBy`, `updatedBy` columns (matching BaseEntity)
3. Update the corresponding entity file to match the migration
4. Use `isNullable: true` for new columns on existing tables with data (to avoid breaking existing rows)
5. Add indexes for columns used in WHERE clauses or JOINs
