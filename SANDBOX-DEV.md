# EngiSuite — Knowledge Engine Merge (Sandbox Dev Config)

This branch (`knowledge-engine`) adds the **Engineer's Educations knowledge engine**
(Certification/Domain/Competency/Lesson 24-section/KnowledgeObject/Question + 5
certifications of full-spec content: CMRP, CRE, PMP, Six Sigma, CAMA) onto the
EngiSuite-Analytics base, using EngiSuite's Express backend (the stronger/more
stable SaaS backend: JWT/OAuth + Stripe + AI + calculators + workflows +
analytics + reports).

## Sandbox dev config (this environment)
- DB: SQLite (dev) — `schema.prisma` provider set to `sqlite` for local dev.
  Production keeps `schema.prisma.production` (MySQL) untouched.
- Ports: Vite frontend on **3000** (exposed by the sandbox gateway), Express
  API on **3001**. `frontend-react/vite.config.js` proxies `/api`,`/learning`,
  `/calculate`, etc. → `127.0.0.1:3001`.
- `.env` (gitignored) — set: `PORT=3001`,
  `DATABASE_URL="file:/abs/path/engisuite.db"`, `JWT_SECRET=...`,
  `CORS_ALLOW_ORIGINS=http://localhost:3000`.

## Run
```
bun install && cd frontend-react && bun install && cd ..
bunx tsx src/server.ts        # Express :3001
cd frontend-react && bunx vite  # Vite :3000 (preview)
```

## Merge plan (phases)
- [x] Phase 0: EngiSuite runs in sandbox (Vite 3000 + Express 3001 + SQLite).
- [ ] Phase 1: Merge knowledge schema — add Engineer's Educations models
      (Certification, Domain, Competency, KnowledgeObject, Reference, Generation
      Matrix, enriched Question, VisualSpec, Simulation) to `schema.prisma`.
      Portable types (no @db.*), works on both SQLite dev & MySQL prod.
- [ ] Phase 2: Port the 5-cert content loaders (src/lib/ref-content/*.ts) →
      EngiSuite Prisma + seed the 83 lessons / 367 questions / 87 KOs.
- [ ] Phase 3: Port knowledge views (Library, Certifications, Coverage Tracker,
      24-section Lesson Viewer, Quiz, Generation Matrix) into the React frontend
      + Express learning routes.
- [ ] Phase 4: Port EngiSuite's engineering workbench (calculators, workflows,
      equations, analytics, simulations, visuals library) stays as-is — the
      knowledge engine links to it (each tool tied to a KnowledgeObject).
