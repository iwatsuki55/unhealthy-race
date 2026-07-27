# Health OS Architecture

Health OS starts as a modular monolith.

The application is one deployable Next.js app, but code is organized around domain modules:

- Today
- Running
- Strength
- Routes
- Goals
- Journal

Each module owns its domain, application, infrastructure, and presentation boundaries where needed.

The Today home screen aggregates read models from modules through application-level query services. It should not own business rules from Running, Strength, Routes, Goals, or Journal.

The MVP uses SQLite through Prisma to keep local development simple. The schema keeps `userId` on user-owned records so the app can evolve toward multi-user support later.
