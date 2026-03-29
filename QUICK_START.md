# 🚀 Quick Start Guide - Employee Ticket System

## 1️⃣ Vytvorte tabuľky v Supabase (POVINNÉ!)

**Prejdite do Supabase Dashboard → SQL Editor a spustite:**

```sql
CREATE TABLE IF NOT EXISTS employees (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tickets (
  id BIGSERIAL PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'novy',
  meno TEXT NOT NULL,
  email TEXT NOT NULL,
  opis_problemu TEXT NOT NULL,
  zakaznik TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_zakaznik ON tickets(zakaznik);
CREATE INDEX IF NOT EXISTS idx_employees_normalized_name ON employees(normalized_name);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on employees" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on tickets" ON tickets FOR ALL USING (true) WITH CHECK (true);
```

## 2️⃣ Vytvorte demo dáta

**Navigácia:** Prejdite na `/demo-data`

**Akcie:**
- Kliknite na "Vytvoriť demo tickety"
- Systém vytvorí 5 testovacích ticketov pre 3 zamestnancov

**Demo zamestnanci:**
- **Ján Horák** - 2 tickety
- **Mária Vargová** - 2 tickety  
- **Peter Molnár** - 1 ticket

## 3️⃣ Prihláste sa ako zamestnanec

**Navigácia:** Prejdite na `/employee/login`

**Test prihlásenie:**
```
Meno: Ján Horák
```

**Výsledok:** Uvidíte 2 pridelené tickety v dashboarde

## 4️⃣ Spravujte tickety

V dashboarde môžete:

✅ **Nový ticket** → Kliknite "Začať riešiť" → Status: V progrese  
✅ **V progrese** → Kliknite "Označiť ako vyriešený" → Status: Vyriešený  
✅ **Vyriešený** → Kliknite "Znovu otvoriť" → Status: V progrese

## 5️⃣ Vytvorte vlastný ticket

**Navigácia:** Prejdite na `/create-ticket`

**Vyplňte formulár:**
```
Meno klienta: Peter Kováč
Email: peter@example.com
Popis problému: Potrebujem pomoc s...
Priradiť zamestnancovi: Ján Horák
Status: Nový
```

**Výsledok:** Ticket bude viditeľný v dashboarde zamestnanca "Ján Horák"

---

## 🎯 Hlavné stránky systému

| URL | Popis |
|-----|-------|
| `/` | Hlavná stránka |
| `/employee/login` | Prihlásenie zamestnanca |
| `/employee/dashboard` | Dashboard so zoznamom ticketov |
| `/create-ticket` | Vytvorenie nového ticketu |
| `/demo-data` | Generátor demo dát |

---

## ⚡ Riešenie problémov

### Problém: Tickety sa nenačítavajú
**Riešenie:** Skontrolujte, či ste vytvorili tabuľky v Supabase (Krok 1)

### Problém: Chyba pri vytváraní ticketu
**Riešenie:** Overte, že existujú tabuľky `employees` a `tickets` v Supabase Dashboard → Table Editor

### Problém: Zamestnanec nevidí tickety
**Riešenie:** Overte, že meno v tickete presne zodpovedá menu pri prihlásení (veľkosť písmen nezáleží)

---

## 📊 Supabase Tabuľky

Po vytvorení uvidíte v **Table Editor**:

**`employees`** - Zoznam zamestnancov
- `id` - ID zamestnanca
- `name` - Meno (napr. "Ján Horák")
- `normalized_name` - Lowercase meno (napr. "ján horák")
- `created_at` - Dátum vytvorenia

**`tickets`** - Zoznam ticketov
- `id` - ID ticketu
- `status` - Status (novy, v_progrese, vyrieseny)
- `meno` - Meno klienta
- `email` - Email klienta
- `opis_problemu` - Popis problému
- `zakaznik` - Priradený zamestnanec (normalized_name)
- `created_at` - Dátum vytvorenia

---

## ✨ Hotovo!

Systém je teraz plne funkčný a pripravený na použitie! 🎉
