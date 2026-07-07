# Audit BavarianHub / RXS x BMW

Data audit: 2026-07-07

## Stare generala

Aplicatia existenta este o baza functionala React + Vite + TypeScript + Supabase, cu PWA, autentificare, profil membru, garaj public, evenimente, bilet QR afisat, panou staff/admin si pagina de scanare QR.

Nu este inca aplicatia finala completa din prompt. Mai multe module sunt doar pregatite in schema SQL sau au butoane/afisari fara flux CRUD complet.

## Module existente

- Auth: email/parola, creare cont si magic link prin Supabase. Lipsesc reset parola si onboarding complet.
- Profil: card digital, date membru, masini proprii si bilete active. Lipsesc editare profil, schimbare parola, stergere cont, puncte fidelitate.
- Garaj: feed public, filtre Recente/Populare/Garajul meu, detaliu masina, adaugare masina, editare masina, soft-hide si upload poze comprimate. Lipsesc reordonare/stergere poze, delete definitiv, like/comentarii reale din UI.
- Evenimente: lista, detaliu eveniment, inscriere simpla si QR in profil. Lipsesc anulare inscriere, capacitate/waitlist in UI, galerie, Waze, plata gestionata complet.
- Scan QR: camera si citire QR in browser. Inca nu valideaza tokenul in Supabase si nu scrie check-in real.
- Admin: dashboard, cautare membri, export CSV, moderare afisata. Lipsesc CRUD membri/evenimente/sponsori/anunturi, schimbare rol/nivel/cotizatie, audit log.
- Sponsori: afisare sponsori pe eveniment. Lipseste cont/dash sponsor.
- PWA: manifest si service worker cu protectie anti-cache stale pe localhost. Lipseste toast de update versiune noua.

## Module lipsa din UI

- Marketplace.
- Concursuri si vot live.
- Harta membrilor.
- Caravane.
- Notificari in-app.
- Push web complet.
- Service Book digital.
- Dashboard sponsor complet.
- Audit log vizibil in admin.

## Butoane/fluxuri incomplete

- `Garaj > Adauga masina`: rezolvat, deschide formular real cu upload poze.
- `Profil > Editeaza profil`: buton fara formular/actiune.
- `Profil > Adauga masina`: rezolvat, duce la formularul real din Garaj.
- `Admin > Editeaza eveniment`: buton fara actiune.
- `Admin > Lista participanti`: buton fara actiune.
- `CarDetail`: afiseaza like/comment count, dar nu permite like/comentariu.
- `ScannerPage`: valideaza doar local in UI, nu in baza de date.

## SQL

Fisierul vechi `SUPABASE_SCHEMA_ONLY.sql` contine baza tabelelor si RLS, dar nu este complet idempotent pentru rerulari, deoarece foloseste `create type`, `create table`, `create policy` si `create trigger` direct.

Am adaugat `supabase/schema.sql` ca prima schema canonica idempotenta pentru structura existenta. Aceasta este punctul de plecare pentru extinderea modulelor din prompt.

## Prioritate recomandata

1. Stabilizare fundatie: `supabase/schema.sql`, README, make admin, auth/onboarding.
2. Eliminare butoane moarte sau transformarea lor in formulare reale.
3. CRUD Garaj + upload poze.
4. Check-in QR real cu Supabase.
5. Admin real pentru membri/evenimente/cotizatii.
6. Marketplace.
7. Concursuri/vot live.
8. Service Book, notificari, sponsori, harta/caravane.
