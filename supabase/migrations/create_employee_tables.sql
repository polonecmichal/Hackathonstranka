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
