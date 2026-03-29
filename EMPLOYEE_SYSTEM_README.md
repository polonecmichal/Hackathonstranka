# Employee Ticket Management System

## Prehľad

Systém pre správu ticketov zamestnancov pre Zero One Hundred. Umožňuje vytváranie ticketov, priraďovanie ich zamestnancom a sledovanie ich stavu.

## ⚠️ DÔLEŽITÉ: Nastavenie databázy

### Krok 1: Vytvorenie tabuliek v Supabase

Pred použitím systému musíte vytvoriť tabuľky v Supabase databáze. Prejdite do Supabase Dashboard:

1. Otvorte svoj Supabase projekt
2. Prejdite na **SQL Editor**
3. Vytvorte nový query
4. Skopírujte a spustite tento SQL kód:

```sql
-- Vytvorenie tabuľky employees (zamestnanci)
CREATE TABLE IF NOT EXISTS employees (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vytvorenie tabuľky tickets
CREATE TABLE IF NOT EXISTS tickets (
  id BIGSERIAL PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'novy',
  meno TEXT NOT NULL,
  email TEXT NOT NULL,
  opis_problemu TEXT NOT NULL,
  zakaznik TEXT NOT NULL, -- normalized_name zamestnanca
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pre rýchlejšie vyhľadávanie ticketov podľa zamestnanca
CREATE INDEX IF NOT EXISTS idx_tickets_zakaznik ON tickets(zakaznik);

-- Index pre normalized_name v employees
CREATE INDEX IF NOT EXISTS idx_employees_normalized_name ON employees(normalized_name);

-- RLS (Row Level Security) - povoliť prístup
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Politiky pre prístup (umožniť všetko pre autentifikovaných používateľov)
CREATE POLICY "Allow all operations on employees" ON employees
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on tickets" ON tickets
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

5. Kliknite **Run** alebo stlačte `Ctrl+Enter`

### Krok 2: Overenie tabuliek

Po spustení SQL, overte že tabuľky boli vytvorené:
1. Prejdite na **Table Editor** v Supabase
2. Mali by ste vidieť 2 nové tabuľky: `employees` a `tickets`

## Ako to funguje

### 1. **Vytvorenie ticketu**
- Prejdite na `/create-ticket` alebo kliknite na "Nový ticket" v navigácii
- Vyplňte formulár:
  - **Meno klienta**: Meno osoby, ktorá potrebuje pomoc
  - **Email klienta**: Kontaktný email
  - **Popis problému**: Detailný popis problému
  - **Priradiť zamestnancovi**: Zadajte meno zamestnanca (napr. "Ján Novák")
  - **Status**: Vyberte počiatočný status (predvolene "Nový")

### 2. **Prihlásenie zamestnanca**
- Zamestnanec prejde na `/employee/login` alebo klikne na "Zamestnanec" v navigácii
- Zadá svoje meno (presne tak, ako je uvedené v ticketoch)
- Systém automaticky vytvorí profil zamestnanca, ak neexistuje

### 3. **Dashboard zamestnanca**
- Po prihlásení zamestnanec uvidí dashboard s:
  - **Štatistiky**: Celkový počet ticketov, tickety v progrese, vyriešené tickety
  - **Grid s ticketmi**: Každý ticket zobrazuje:
    - Status (Nový / V progrese / Vyriešený)
    - Meno a email klienta
    - Popis problému
    - Dátum vytvorenia
    - Akčné tlačidlá na zmenu statusu

### 4. **Správa ticketov**
Zamestnanec môže meniť status ticketu:
- **Nový** → "Začať riešiť" → **V progrese**
- **V progrese** → "Označiť ako vyriešený" → **Vyriešený**
- **Vyriešený** → "Znovu otvoriť" → **V progrese**

## Backend API Endpoints

### Tickets
- `POST /make-server-87f31c81/tickets` - Vytvoriť nový ticket
- `GET /make-server-87f31c81/tickets` - Získať všetky tickety
- `PUT /make-server-87f31c81/tickets/:id` - Aktualizovať ticket
- `GET /make-server-87f31c81/employee/:name/tickets` - Získať tickety pre zamestnanca

### Employees
- `POST /make-server-87f31c81/employee/login` - Prihlásiť zamestnanca

## Dátová štruktúra

### Ticket
```typescript
{
  id: string,
  status: "novy" | "v_progrese" | "vyrieseny",
  meno: string,
  email: string,
  opisProblemu: string,
  zakaznik: string, // normalized employee name
  createdAt: string,
  updatedAt: string
}
```

### Employee
```typescript
{
  name: string,
  normalizedName: string,
  createdAt: string
}
```

## KV Store Keys

- `employee:{normalizedName}` - Údaje o zamestnancovi
- `employee:{normalizedName}:tickets` - Zoznam ticket IDs pre zamestnanca
- `ticket:{id}` - Údaje o tickete
- `all_employees` - Zoznam všetkých zamestnancov
- `all_tickets` - Zoznam všetkých ticketov

## Príklad použitia

1. **Vytvorte ticket:**
   - Meno: "Peter Kováč"
   - Email: "peter@example.com"
   - Problém: "Potrebujem pomoc s nastavením účtu"
   - Zamestnanec: "Mária Novotná"

2. **Prihlásenie zamestnanca:**
   - Zamestnanec "Mária Novotná" sa prihlási
   - Systém zobrazí ticket od Petra Kováča

3. **Riešenie:**
   - Mária klikne "Začať riešiť" → status sa zmení na "V progrese"
   - Po vyriešení klikne "Označiť ako vyriešený" → status sa zmení na "Vyriešený"

## Poznámky

- Mená zamestnancov sú case-insensitive (veľkosť písmen nezáleží)
- Zamestnanci sa vytvárajú automaticky pri prvom prihlásení
- Tickety sú zobrazené od najnovších po najstaršie
- System používa Supabase KV store na ukladanie dát