# BavarianHub - RXS x BMW

Platforma web pentru club BMW, construita cu React 19, Vite, TypeScript, Tailwind CSS v4 si Supabase.

Important: promptul initial cerea mobile-only, dar proiectul este ajustat pentru folosire reala si pe calculator. Membrii au experienta mobile-first, cu bottom tab bar pe telefon. Staff-ul si adminii au layout desktop cu navigatie laterala, tabele, exporturi si spatiu util pentru operare.

## Ce este inclus

- PWA instalabila, cu manifest si service worker.
- Design premium dark in stil RXS Studio.
- Navigatie mobile bottom tabs si desktop sidebar.
- Pagini demo: Acasa, Garaj, Detaliu masina, Evenimente, Detaliu eveniment, Profil, Admin, Scan QR, Login.
- Card digital de membru cu QR.
- Garaj virtual cu feed, like la dublu tap si detalii masina.
- Evenimente cu inscriere demo, bilet QR si statistici check-in.
- Panou admin/staff cu statistici, cautare membri, moderare si export CSV.
- Schema Supabase completa in `SUPABASE_SETUP.md`.

## Rulare locala

```bash
pnpm install
pnpm dev
```

Aplicatia porneste implicit la:

```text
http://localhost:5173
```

## Configurare Supabase

1. Creeaza un proiect nou in Supabase.
2. Copiaza `.env.example` in `.env.local`.
3. Completeaza:

```bash
VITE_SUPABASE_URL=https://project-id.supabase.co
VITE_SUPABASE_ANON_KEY=anon-key
```

4. Ruleaza scripturile din `SUPABASE_SETUP.md` in SQL Editor.
5. Creeaza bucket-urile Storage mentionate acolo: `avatars`, `car-photos`, `event-covers`, `event-gallery`, `sponsor-logos`.

## Conturi demo recomandate

Creeaza aceste conturi in Supabase Auth, apoi seteaza rolurile in tabelul `profiles`:

```text
admin@bavarianhub.ro / BavarianHub2026!
membru@bavarianhub.ro / BavarianHub2026!
staff@bavarianhub.ro / BavarianHub2026!
```

Aplicatia ruleaza si fara Supabase, in modul demo local, ca sa poti vedea rapid interfata.

## Deploy Netlify

Setari Netlify:

```text
Build command: pnpm build
Publish directory: dist
```

Redirectul pentru SPA este deja inclus in `netlify.toml`.

## Deploy automat catre GitHub

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

Autentificarea GitHub nu este salvata in script. Daca GitHub cere login, se va folosi Git Credential Manager sau autentificarea deja existenta pe calculator.

## Structura

```text
src/
  brand.ts                 Branding schimbabil dintr-un singur loc
  components/              Shell, header si UI primitives
  data/mock.ts             Date demo romanesti
  features/                Card membru, card masina, card eveniment, PWA banner
  lib/                     Supabase, formatare, PWA helpers
  pages/                   Rutele aplicatiei
```

## Verificare

```bash
pnpm build
```

Build-ul ruleaza TypeScript strict si apoi produce varianta de productie Vite.
