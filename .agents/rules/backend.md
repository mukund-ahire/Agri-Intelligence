---
trigger: always_on
---


---

# 5. `.agents/rules/backend.md`

```md
---
trigger: glob
globs: "*.ts, *.js, *.py, *.java, *.kt, *.go"
description: Backend rules for APIs, databases, authentication, business logic, and Google Cloud integrations.
---

# Backend Rules

## Objective

Build a reliable backend supporting the complete hackathon workflow.

The backend may contain:

- APIs
- Business logic
- Database access
- AI services
- Authentication
- Validation
- External integrations
- Error handling
- Logging

## Before Editing

Inspect:

- Backend structure
- Controllers
- Routes
- Services
- Database schema
- ORM
- Authentication
- Environment variables
- Existing tests

Do not rewrite the backend unnecessarily.

## API Design

Every endpoint should define:

```text
HTTP Method
Route
Request
Validation
Authentication
Business Logic
Response
Error Handling