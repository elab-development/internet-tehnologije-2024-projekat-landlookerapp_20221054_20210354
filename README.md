# LandLooker (Lanlooker) — Full-stack web aplikacija za menadžment nekretnina

LandLooker je moderna full-stack aplikacija za pregled, upravljanje i rezervisanje nekretnina. Aplikacija nudi jasno odvojene korisničke uloge (neulogovan posetilac, kupac i radnik/prodavac), bogat UI sa **360°** prikazom slika, **interaktivnim mapama** i **grafikonima**, kao i kompletan **CRUD** i tok **rezervacija** (bookinga) uz **izvoz u CSV**.

---

## Tehnologije

- **Frontend:** React.js (hooks, funkcionalne komponente), React Router, Axios  
- **Vizuelni elementi:**
  - 360° prikaz: _Panorama 360_ (Photo Sphere Viewer wrapper)
  - Grafici: **Recharts**
  - Mape: **OpenStreetMap** + **Leaflet**
  - Pozadinski “hero” slajder (10 slika `public/assets/slider1..10.jpg`)
- **Backend:** Laravel (REST API, Sanctum autentikacija, API Resources, validacije)
- **Baza:** MySQL (migracije, seeders, factories)
- **Javni web servisi:**
  - **Picsum** — random/placeholder slike
  - **DummyJSON** — citati/quotes za hero sekcije

---

## Uloge i funkcionalnosti

### 1) Neulogovani korisnik (posetilac)
- Pregled liste nekretnina (**Properties**) i detalja jedne nekretnine (**Property Info**).
- Na detalju su dostupni: osnovni podaci, glavna slika i **360°** prikaz (ako je podešen).
- Za rezervacije i zaštićene akcije — potrebno je prijavljivanje.

### 2) Kupac (buyer)
- **Auth:** registracija i login (Laravel Sanctum token se čuva u `sessionStorage`).
- **Rezervacije:**
  - Na **Property Info** kupac otvara modal **“Book now”** i kreira rezervaciju: bira datum, način plaćanja i **radnika (worker)**.
  - Na stranici **My Bookings** vidi **samo svoje** rezervacije, može da ih **izmeni** (datum, cena, način plaćanja) ili **obriše**.  
    Status je **read-only** u “Edit booking” modalu.
  - Dugme **Export CSV** poziva `/api/bookings/export/csv` i preuzima fajl.
- **UI:** avatar sa inicijalima, meni stavke prilagođene ulozi, auth stranice sa pozadinskim slajderom.

### 3) Radnik (worker/seller)
- **Manage Properties:** kompletan CRUD (kreiranje/izmena/brisanje) sa paginacijom (npr. 6 po strani).
  - **Lokacija** se bira iz **combo-box-a po nazivu** (iza scene se šalje odgovarajući `location_id`).
  - U dnu stranice je **OSM/Leaflet** mapa sa markerima za sve nekretnine koje imaju koordinate (lat/lng).
- **Manage Bookings:** prikazuje sve **rezervacije dodeljene tom radniku** (`worker_id == ulogovani radnik`).
  - Radnik može da menja **status** rezervacije (pending/confirmed/cancelled).
  - Ispod liste je **statistika** (Recharts) — top bookirane nekretnine (ruta `/api/booking-statistics`).
- **Worker Home:** posebna “landing” stranica sa CTA: **Manage Properties** i **Manage Bookings**.

---

## Arhitektura i integracije

### API rute (primer)
- **Auth:**  
  `POST /api/register`, `POST /api/login`, `POST /api/logout`
- **Nekretnine (public):**  
  `GET /api/properties`, `GET /api/properties/{id}`
- **Nekretnine (worker):**  
  `POST /api/properties`, `PUT /api/properties/{id}`, `DELETE /api/properties/{id}`,  
  `PATCH /api/properties/{id}/price`
- **Pretraga i sortiranje (buyer):**  
  `POST /api/properties/search`, `POST /api/properties/sort`
- **Lokacije:**  
  `GET /api/locations` (vraća `id`, `name` + koordinate; front prikazuje imena, šalje `location_id`)
- **Radnici (za izbor pri bookingu):**  
  `GET /api/workers`
- **Bookings (buyer):**  
  `GET /api/bookings`, `GET /api/bookings/{id}`,  
  `POST /api/bookings`, `PUT /api/bookings/{id}`, `DELETE /api/bookings/{id}`,  
  `GET /api/bookings/export/csv` (izvoz sopstvenih booking-a)
- **Statistika (worker):**  
  `GET /api/booking-statistics` (Top 5 nekretnina po broju rezervacija)

### Autentikacija i autorizacija
- **Laravel Sanctum** izdaje token; front ga čuva u `sessionStorage` (`authToken`) i šalje kao `Authorization: Bearer <token>`.
- Backend validacijom i middleware-ima sprovodi restrikcije:
  - **buyer**: vidi/menja **samo svoje** rezervacije; može da pretražuje/sortira.
  - **worker**: CRUD nad nekretninama, vidi i menja status booking-a dodeljenih njemu, pristupa statistici.

### 360° prikaz
- Komponenta **Panorama 360** renderuje equirectangular panoramu.  
- Preporuka: služiti slike iz **istog origin-a** (Laravel `public/` ili preko Node proxy) kako bi se izbegao CORS.

### OSM/Leaflet mapa
- Marker-i crtaju iz koordinata (`latitude`, `longitude`).
- Nakon postavljanja marker-a, mapa se **fit-uje na bounds**.
- Ako nekretnina nema “embedded” lokaciju, front spaja preko `location_id` sa listom lokacija ili učitava detalj.

### Recharts
- U `ManageBookings` prikazuje **Top 5** nekretnina po broju rezervacija (podatke vraća `/api/booking-statistics`).

---

## Stranice i ključne komponente (frontend)

- **Auth:** `Login.jsx`, `Register.jsx` (pozadinski slajder `slider1..10.jpg`, forma, validacije).  
  Nakon logina: **buyer → `/home`**, **worker → `/worker-home`**.
- **Navigacija:** `Menu.jsx`
  - Avatar (inicijali), “Currently logged in”, **dynamic meni** po ulozi:
    - Buyer: Home, Properties, About Us, My Bookings
    - Worker: Worker Home, Manage Properties, Manage Bookings
  - Logout: poziva `/api/logout` (Bearer), briše sesiju i preusmerava na `/`.
- **Kupac:**
  - `PropertyInfo.jsx` — detalji, glavna slika, **360°** viewer, dugme **Book Now** (modal).
  - `BuyerBookings.jsx` — lista sopstvenih booking-a, **Edit** (status read-only), **Delete**, **Export CSV**.
- **Radnik:**
  - `WorkerMain.jsx` — landing sa CTA ka upravljačkim stranicama.
  - `WorkerProperties.jsx` — CRUD + paginacija + **OSM mapa**; lokacija preko **combo-box** (po **imenu**).
  - `ManageBookings.jsx` — lista booking-a dodeljenih radniku + promena statusa + **Recharts** statistika.

---

## Baza podataka i seed

- **Migracije** kreiraju tabele: `users`, `properties`, `locations`, `bookings`, …
- **Seed/Factory:**
  - `LocationSeeder` može koristiti **realne koordinate** (npr. glavni gradovi) radi smislenih markera.
  - `PropertySeeder` dodeljuje **različite** `location_id` vrednosti (npr. shuffle pa kruženje kroz niz) kako bi pokrio više lokacija.

---

## Pokretanje projekta (lokal)

> Pretpostavke: instalirani **Node 18+**, **PHP 8.2+**, **Composer**, **MySQL**.

1. Klonirajte repozitorijum:
```bash
    git clone https://github.com/elab-development/internet-tehnologije-2024-projekat-landlookerapp_20221054_20210354.git
```
2. Pokrenite backend:
```bash
   cd land-looker-app-backend
   composer install
   php artisan migrate:fresh --seed
   php artisan serve
```
    
3. Pokrenite frontend:
```bash
   cd land-looker-app-frontend
   npm install
   npm start
```
    
4.  Frontend pokrenut na: [http://localhost:3000](http://localhost:3000) Backend API pokrenut na: [http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)
