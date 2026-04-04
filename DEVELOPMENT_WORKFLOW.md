# Development Workflow

This repository is set up for local development first.

## Daily workflow

1. Install dependencies:
   ```bash
   npm run install:all
   ```
2. Start frontend + backend:
   ```bash
   npm run dev
   ```
3. Before pushing:
   ```bash
   npm run verify
   ```

## CI kept in this repo

The project keeps only a minimal CI workflow for development:
- install dependencies
- lint frontend
- build frontend
- run backend tests

## Removed from this dev-focused package

The following deployment-focused files were removed to keep the project lighter during development:
- Docker and docker-compose files
- deployment scripts and nginx config
- release/CD workflow
- production env example files that were only for the removed deployment setup

Add deployment tooling back later when the app is stable enough to ship.
