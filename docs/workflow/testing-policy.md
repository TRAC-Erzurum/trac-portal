# Testing policy

The program-wide rule, copied verbatim into every AGENTS.md and task brief:

> Tests are expensive; keep them to a minimum. Do not add tests by default and never add "write tests" as a routine acceptance criterion. Add a test only when it rests on a solid reason: authentication/authorization, data integrity or irreversible operations, non-trivial pure logic (parsing, date/time, state machines), or a production bug likely to recur. State that reason in one sentence in the PR description. End-to-end tests and any new test framework/infrastructure require explicit approval from the project owner. Do not write tests for trivial CRUD, getters, rendering/snapshots, or mock-heavy controller code. Existing tests stay and must pass.

## Justified tests (examples)

- **Authorization:** a test that a `volunteer` cannot call an admin-only endpoint. Reason: authorization.
- **Data integrity:** a test that a migration or service rejects a duplicate branch membership. Reason: data integrity.
- **Pure logic:** a test for a date-range parser that handles timezone boundaries. Reason: date/time logic.
- **Recurring production bug:** a regression test for a bug that broke a report export twice. Reason: likely to recur.

## Unjustified tests (do not add)

- A getter or DTO-mapping test with no logic.
- A CRUD controller test that mocks the service and asserts it was called.
- A snapshot of a rendered component or a page layout.
- A "write tests for this feature" acceptance criterion added to a routine task.
- A new E2E suite or test framework, without owner approval.

## In the PR

State the reason in one sentence, for example: "Adds a test for role checks on the export endpoint (authorization)." If no test is added, no justification is needed.
