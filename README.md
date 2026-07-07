# BavarianHub - RXS x BMW

Platforma web pentru club BMW, construita cu React 19, Vite, TypeScript, Tailwind CSS v4 si Supabase.

Aplicatia este mobile-first pentru membri si are layout desktop real pentru staff/admin.

## Ce este inclus

- PWA instalabila, cu manifest si service worker.
- Design premium dark in stil RXS Studio.
- Navigatie mobile bottom tabs si desktop sidebar.
- Pagini: Acasa, Garaj, Detaliu masina, Evenimente, Detaliu eveniment, Profil, Admin, Scan QR, Login.
- Card digital de membru cu QR.
- Garaj virtual cu feed si detalii masina.
- Evenimente cu inscriere, bilet QR si statistici check-in.
- Panou admin/staff cu statistici, cautare membri, moderare si export CSV.
- Schema Supabase canonica in `supabase/schema.sql`.
- Script pentru facut cont admin in `supabase/make_admin.sql`.
- Script pentru sters seed demo in `SUPABASE_DELETE_DEMO_DATA.sql`.
- Audit al starii curente in `docs/AUDIT.md`.

## Rulare Locala

```bash
pnpm install
pnpm dev
```

Aplicatia porneste implicit la:

```text
http://localhost:5173
```

## Configurare Supabase

1. Creeaza sau deschide proiectul Supabase.
2. Copiaza `.env.example` in `.env.local`.
3. Completeaza:

```bash
VITE_SUPABASE_URL=https://project-id.supabase.co
VITE_SUPABASE_ANON_KEY=publishable-or-anon-key
```

4. Ruleaza `supabase/schema.sql` in SQL Editor.
5. Creeaza-ti cont din aplicatie, apoi ruleaza `supabase/make_admin.sql` dupa ce inlocuiesti emailul.
6. Nu rula seed demo daca nu vrei date de test.
7. Daca ai rulat deja seed-ul demo, ruleaza `SUPABASE_DELETE_DEMO_DATA.sql`.

Aplicatia nu mai include date demo hardcodate. Daca tabelele Supabase sunt goale, interfata afiseaza stari goale.

Fișierul vechi `SUPABASE_SCHEMA_ONLY.sql` ramane temporar pentru compatibilitate, dar sursa principala pentru setup nou este `supabase/schema.sql`.

## Deploy Railway

Railway foloseste `railway.json`.

```text
Build command: pnpm build
Start command: pnpm start
```

In Railway, seteaza la Variables:

```text
VITE_SUPABASE_URL=https://project-id.supabase.co
VITE_SUPABASE_ANON_KEY=publishable-or-anon-key
```

Nu seta cheia `service_role`, `sb_secret`, parola bazei de date sau JWT secret in frontend.

Dupa ce modifici variabilele, ruleaza un redeploy nou in Railway.

## Deploy Automat Catre GitHub

Pentru repository-ul `https://github.com/vrobeert/rxsbmw.git`, foloseste unul dintre launcherele din radacina proiectului:

```text
Deploy-RXS-BMW.exe
Deploy-RXS-BMW.cmd
deploy-to-github.ps1
```

La rulare, scriptul:

- verifica build-ul cu `pnpm build`
- initializeaza Git daca folderul nu are `.git`
- seteaza remote-ul `origin`
- face commit cu mesaj automat
- impinge branch-ul `main` pe GitHub

Autentificarea GitHub nu este salvata in script.

## Structura

```text
src/
  brand.ts                 Branding schimbabil dintr-un singur loc
  components/              Shell, header si UI primitives
  features/                Card membru, card masina, card eveniment, PWA banner
  lib/                     Supabase, date reale, formatare, PWA helpers
  pages/                   Rutele aplicatiei
```

## Verificare

```bash
pnpm build
```

Build-ul ruleaza TypeScript strict si apoi produce varianta de productie Vite.

## Stare Productie

Vezi `docs/AUDIT.md` pentru inventarul modulelor existente, module lipsa si butoane care trebuie transformate in fluxuri reale inainte de livrarea finala.
