# Ticket Bro repair checklist

## Completed in this pass
- [x] Unpacked and mapped backend + frontend structure
- [x] Fixed broken frontend import paths
- [x] Added missing shared `DatePicker` component used by booking forms
- [x] Implemented missing `useDebounce` hook
- [x] Implemented missing `useOnClickOutside` / `useClickOutside` hook
- [x] Reworked `LocationSelector` to use the actual `LocationContext` contract
- [x] Fixed `MobileMenu` auth hook import path
- [x] Added breadcrumb re-export wrapper expected by imports
- [x] Fixed `eventsService` default export so event detail pages can call reviews / tickets helpers safely
- [x] Removed hardcoded fallback-heavy venue/details behavior in shared event detail sections and made them backend-driven / safe-empty
- [x] Fixed backend organizer slug generator to use the real organizer model
- [x] Added backend waitlist endpoints and controller handlers to match the frontend waitlist flow
- [x] Ran static import resolution checks to eliminate unresolved local imports in frontend

## Remaining work before a real production release
- [ ] Full dependency installation and clean build verification in a normal dev environment
- [ ] End-to-end backend startup verification with real `.env` values and MongoDB
- [ ] Frontend build/lint verification with a complete working `node_modules`
- [ ] Route-by-route manual QA across public, organizer, moderator, admin, and super-admin flows
- [ ] Payment gateway and mail provider live integration testing
- [ ] Realtime websocket verification with a running backend + frontend pair
- [ ] Full security hardening review, rate-limit validation, and audit-log QA

## Important note
This repository was improved in a targeted hardening pass inside the current container, but it has **not** been fully proven as production-ready inside this environment because package installation/build execution was incomplete here. Use this pass as a cleaned handoff for the next run in your real local/Codex environment.
