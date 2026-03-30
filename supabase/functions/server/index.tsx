import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ─── Helper: get table columns by sampling a row ─────────────────────────────
async function getTableColumns(tableName: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(5);

    if (error || !data || data.length === 0) {
      console.log(`Could not detect columns for ${tableName}:`, error?.message);
      return [];
    }
    return Object.keys(data[0]);
  } catch (e) {
    console.log(`Exception detecting columns for ${tableName}:`, e);
    return [];
  }
}

// ─── Helper: find the best matching column from candidates ───────────────────
function pickColumn(columns: string[], candidates: string[]): string | null {
  for (const c of candidates) {
    if (columns.includes(c)) return c;
  }
  return null;
}

// ─── Schema inspection endpoint ───────────────────────────────────────────────
app.get("/make-server-87f31c81/schema/:tableName", async (c) => {
  try {
    const tableName = c.req.param("tableName");
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(3);

    if (error) {
      return c.json({ error: "Table not found or access denied", details: error.message }, 404);
    }

    const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
    return c.json({ success: true, tableName, columns, sampleRows: data || [] });
  } catch (error) {
    console.error("Schema inspection error:", error);
    return c.json({ error: "Schema inspection failed", details: String(error) }, 500);
  }
});

// ─── Health check endpoint ────────────────────────────────────────────────────
app.get("/make-server-87f31c81/health", (c) => {
  return c.json({ status: "ok" });
});

// ─── Submit a new request ─────────────────────────────────────────────────────
app.post("/make-server-87f31c81/requests", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, userType, requestType, description, priority, company, source } = body;

    if (!name || !email || !userType || !requestType || !description) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const requestId = `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const request = {
      id: requestId,
      name,
      email,
      userType,
      requestType,
      description,
      priority: priority || "medium",
      company: company || "",
      source: source || "web",
      status: "pending",
      assignedTo: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      resolved: false,
      valueDelivered: null,
      notes: []
    };

    await kv.set(requestId, request);

    const allRequests = await kv.get("all_requests") || { ids: [] };
    allRequests.ids.unshift(requestId);
    await kv.set("all_requests", allRequests);

    console.log(`Request created successfully: ${requestId}`);
    return c.json({ success: true, requestId, request });
  } catch (error) {
    console.error("Error creating request:", error);
    return c.json({ error: "Failed to create request", details: String(error) }, 500);
  }
});

// ─── Get all requests ─────────────────────────────────────────────────────────
app.get("/make-server-87f31c81/requests", async (c) => {
  try {
    const allRequests = await kv.get("all_requests") || { ids: [] };
    const requests = [];

    for (const id of allRequests.ids) {
      const request = await kv.get(id);
      if (request) requests.push(request);
    }

    return c.json({ success: true, requests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return c.json({ error: "Failed to fetch requests", details: String(error) }, 500);
  }
});

// ─── Get a single request ─────────────────────────────────────────────────────
app.get("/make-server-87f31c81/requests/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const request = await kv.get(id);

    if (!request) {
      return c.json({ error: "Request not found" }, 404);
    }

    return c.json({ success: true, request });
  } catch (error) {
    console.error("Error fetching request:", error);
    return c.json({ error: "Failed to fetch request", details: String(error) }, 500);
  }
});

// ─── Update a request ─────────────────────────────────────────────────────────
app.put("/make-server-87f31c81/requests/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    const existingRequest = await kv.get(id);
    if (!existingRequest) {
      return c.json({ error: "Request not found" }, 404);
    }

    const updatedRequest = {
      ...existingRequest,
      ...body,
      updatedAt: new Date().toISOString()
    };

    await kv.set(id, updatedRequest);

    console.log(`Request updated successfully: ${id}`);
    return c.json({ success: true, request: updatedRequest });
  } catch (error) {
    console.error("Error updating request:", error);
    return c.json({ error: "Failed to update request", details: String(error) }, 500);
  }
});

// ─── AI Chatbot endpoint ──────────────────────────────────────────────────────
app.post("/make-server-87f31c81/chatbot", async (c) => {
  try {
    const body = await c.req.json();
    const { message, context } = body;

    if (!message) {
      return c.json({ error: "Message is required" }, 400);
    }

    const response = generateAIResponse(message, context);
    return c.json({ success: true, response });
  } catch (error) {
    console.error("Error in chatbot:", error);
    return c.json({ error: "Chatbot error", details: String(error) }, 500);
  }
});

// ─── Matchmaking ──────────────────────────────────────────────────────────────
app.post("/make-server-87f31c81/matchmaking", async (c) => {
  try {
    const body = await c.req.json();
    const { requestType, description } = body;

    const suggestions = suggestTeamMembers(requestType, description);
    return c.json({ success: true, suggestions });
  } catch (error) {
    console.error("Error in matchmaking:", error);
    return c.json({ error: "Matchmaking error", details: String(error) }, 500);
  }
});

// ─── Get team members ─────────────────────────────────────────────────────────
app.get("/make-server-87f31c81/team", async (c) => {
  try {
    const team = await kv.get("team_members") || { members: [] };
    return c.json({ success: true, team: team.members });
  } catch (error) {
    console.error("Error fetching team:", error);
    return c.json({ error: "Failed to fetch team", details: String(error) }, 500);
  }
});

// ─── Add team member ──────────────────────────────────────────────────────────
app.post("/make-server-87f31c81/team", async (c) => {
  try {
    const body = await c.req.json();
    const { name, role, expertise, email } = body;

    if (!name || !role || !email) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const memberId = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const member = {
      id: memberId,
      name,
      role,
      expertise: expertise || [],
      email,
      createdAt: new Date().toISOString()
    };

    const team = await kv.get("team_members") || { members: [] };
    team.members.push(member);
    await kv.set("team_members", team);

    return c.json({ success: true, member });
  } catch (error) {
    console.error("Error adding team member:", error);
    return c.json({ error: "Failed to add team member", details: String(error) }, 500);
  }
});

// ─── Employee Login (schema-flexible) ────────────────────────────────────────
app.post("/make-server-87f31c81/employee/login", async (c) => {
  try {
    const body = await c.req.json();
    const { name } = body;

    if (!name) {
      return c.json({ error: "Meno je povinné" }, 400);
    }

    const searchName = name.trim();

    // Get real columns from employees table
    const empColumns = await getTableColumns('employees');
    console.log(`Employees table columns: ${empColumns.join(', ')}`);

    // Try possible name columns in priority order
    const nameCandidates = ['name', 'meno', 'full_name', 'employee_name', 'first_name', 'surname', 'username', 'display_name'];
    const nameCol = pickColumn(empColumns, nameCandidates);

    if (!nameCol && empColumns.length === 0) {
      return c.json({
        error: "Tabuľka employees je prázdna alebo neexistuje",
        hint: "Skontrolujte Supabase databázu"
      }, 404);
    }

    // If we found a name column, search by it; otherwise try all text columns
    const columnsToTry = nameCol
      ? [nameCol]
      : empColumns.filter(col => !['id', 'created_at', 'updated_at'].includes(col));

    let employee = null;
    let foundCol = '';

    for (const col of columnsToTry) {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .ilike(col, searchName)
          .limit(1);

        if (!error && data && data.length > 0) {
          employee = data[0];
          foundCol = col;
          break;
        }
        // Also try with trimmed lowercase
        const { data: data2, error: error2 } = await supabase
          .from('employees')
          .select('*')
          .ilike(col, `%${searchName}%`)
          .limit(1);

        if (!error2 && data2 && data2.length > 0) {
          employee = data2[0];
          foundCol = col;
          break;
        }
      } catch (colErr) {
        console.log(`Column ${col} doesn't exist or error:`, colErr);
        continue;
      }
    }

    if (!employee) {
      console.log(`Employee not found: "${searchName}", tried columns: ${columnsToTry.join(', ')}`);
      return c.json({
        error: `Zamestnanec "${searchName}" nebol nájdený`,
        hint: `Dostupné stĺpce v tabuľke employees: ${empColumns.join(', ')}`,
        availableColumns: empColumns
      }, 404);
    }

    console.log(`Employee found via column "${foundCol}": ${employee[foundCol]}`);

    // Determine the display name and normalized name
    const displayName = employee[foundCol] || employee[Object.keys(employee).find(k => !['id', 'created_at', 'updated_at'].includes(k)) || 'id'];
    const normalizedName = String(displayName).toLowerCase().trim();

    return c.json({
      success: true,
      employee: {
        id: employee.id,
        name: displayName,
        normalizedName,
        nameColumn: foundCol,
        rawData: employee
      }
    });
  } catch (error) {
    console.error("Error during employee login:", error);
    return c.json({ error: "Chyba pri prihlásení", details: String(error) }, 500);
  }
});

// ─── Customer Login (schema-flexible) ────────────────────────────────────────
app.post("/make-server-87f31c81/customer/login", async (c) => {
  try {
    const body = await c.req.json();
    const { name } = body;

    if (!name) {
      return c.json({ error: "Meno je povinné" }, 400);
    }

    const searchName = name.trim();

    // Get real columns from tickets table
    const tickColumns = await getTableColumns('tickets');
    console.log(`Tickets table columns: ${tickColumns.join(', ')}`);

    if (tickColumns.length === 0) {
      return c.json({
        error: "Tabuľka tickets je prázdna alebo neexistuje",
        hint: "Skontrolujte Supabase databázu"
      }, 404);
    }

    // Possible customer/contact name columns in tickets
    const nameCandidates = ['meno', 'name', 'customer_name', 'client_name', 'contact_name', 'first_name', 'full_name', 'user_name'];
    const nameCol = pickColumn(tickColumns, nameCandidates);

    const columnsToTry = nameCol
      ? [nameCol]
      : tickColumns.filter(col => !['id', 'created_at', 'updated_at', 'status'].includes(col)).slice(0, 5);

    let ticket = null;
    let foundCol = '';

    for (const col of columnsToTry) {
      try {
        const { data, error } = await supabase
          .from('tickets')
          .select('*')
          .ilike(col, searchName)
          .limit(1);

        if (!error && data && data.length > 0) {
          ticket = data[0];
          foundCol = col;
          break;
        }

        const { data: data2, error: error2 } = await supabase
          .from('tickets')
          .select('*')
          .ilike(col, `%${searchName}%`)
          .limit(1);

        if (!error2 && data2 && data2.length > 0) {
          ticket = data2[0];
          foundCol = col;
          break;
        }
      } catch (colErr) {
        console.log(`Column ${col} error:`, colErr);
        continue;
      }
    }

    if (!ticket) {
      console.log(`Customer not found: "${searchName}", tried columns: ${columnsToTry.join(', ')} — allowing login with empty ticket list`);
      // Allow login even if not found — customer will see empty ticket list
      return c.json({
        success: true,
        customer: {
          name: searchName,
          email: '',
          nameColumn: null,
          rawData: null
        }
      });
    }

    console.log(`Customer found via column "${foundCol}": ${ticket[foundCol]}`);

    const customerName = ticket[foundCol] || searchName;

    return c.json({
      success: true,
      customer: {
        name: customerName,
        email: ticket.email || ticket.mail || '',
        nameColumn: foundCol,
        rawData: ticket
      }
    });
  } catch (error) {
    console.error("Error during customer login:", error);
    return c.json({ error: "Chyba pri prihlásení zákazníka", details: String(error) }, 500);
  }
});

// ─── Get Customer Tickets (schema-flexible) ───────────────────────────────────
app.get("/make-server-87f31c81/customer/:name/tickets", async (c) => {
  try {
    const name = decodeURIComponent(c.req.param("name")).trim();

    const tickColumns = await getTableColumns('tickets');

    // Find name column
    const nameCandidates = ['meno', 'name', 'customer_name', 'client_name', 'contact_name', 'first_name'];
    const nameCol = pickColumn(tickColumns, nameCandidates) || 'meno';

    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('*')
      .ilike(nameCol, `%${name}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching customer tickets:", error);
      // Try fallback with id search
      return c.json({
        error: "Chyba pri načítaní ticketov zákazníka",
        details: error.message,
        hint: `Stĺpec pre meno zákazníka: "${nameCol}", dostupné stĺpce: ${tickColumns.join(', ')}`
      }, 500);
    }

    return c.json({ success: true, tickets: tickets || [], nameColumn: nameCol });
  } catch (error) {
    console.error("Error fetching customer tickets:", error);
    return c.json({ error: "Chyba pri načítaní ticketov zákazníka", details: String(error) }, 500);
  }
});

// ─── Get Employee Tickets (schema-flexible) ───────────────────────────────────
app.get("/make-server-87f31c81/employee/:name/tickets", async (c) => {
  try {
    const name = decodeURIComponent(c.req.param("name")).trim();

    const tickColumns = await getTableColumns('tickets');
    console.log(`Fetching tickets for employee: "${name}", columns: ${tickColumns.join(', ')}`);

    // Possible column names for "assigned employee" in tickets
    const assignCandidates = ['zakaznik', 'zamestnanec', 'employee', 'assigned_to', 'employee_name', 'assignee', 'handler', 'owner'];
    const assignCol = pickColumn(tickColumns, assignCandidates);

    if (!assignCol) {
      console.log(`No assignment column found in tickets. Available: ${tickColumns.join(', ')}`);
      return c.json({
        success: true,
        tickets: [],
        warning: `Nebol nájdený stĺpec pre priradenie zamestnanca. Dostupné stĺpce: ${tickColumns.join(', ')}`
      });
    }

    // Try exact match first, then partial
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('*')
      .ilike(assignCol, `%${name}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching employee tickets:", error);
      return c.json({
        error: "Chyba pri načítaní ticketov",
        details: error.message,
        hint: `Použitý stĺpec: "${assignCol}"`
      }, 500);
    }

    return c.json({ success: true, tickets: tickets || [], assignColumn: assignCol });
  } catch (error) {
    console.error("Error fetching employee tickets:", error);
    return c.json({ error: "Chyba pri načítaní ticketov", details: String(error) }, 500);
  }
});

// ─── Setup: Create employee and assign tickets ────────────────────────────────
app.post("/make-server-87f31c81/setup-employee", async (c) => {
  try {
    const body = await c.req.json();
    const { employeeName, ticketNumbers } = body;

    if (!employeeName) {
      return c.json({ error: "employeeName je povinný" }, 400);
    }

    const targetTickets = ticketNumbers || ['01010102', '02110403'];

    // 1. Inspect schemas
    const empColumns = await getTableColumns('employees');
    const tickColumns = await getTableColumns('tickets');

    console.log(`Employees columns: ${empColumns.join(', ')}`);
    console.log(`Tickets columns: ${tickColumns.join(', ')}`);

    // 2. Find name column for employees
    const empNameCandidates = ['name', 'meno', 'full_name', 'employee_name', 'first_name', 'display_name'];
    const empNameCol = pickColumn(empColumns, empNameCandidates);

    if (!empNameCol) {
      return c.json({
        error: "Nebol nájdený stĺpec pre meno v tabuľke employees",
        availableColumns: empColumns
      }, 400);
    }

    // 3. Find or create employee
    let employee: any = null;

    const { data: existingEmps } = await supabase
      .from('employees')
      .select('*')
      .ilike(empNameCol, employeeName)
      .limit(1);

    if (existingEmps && existingEmps.length > 0) {
      employee = existingEmps[0];
      console.log(`Employee already exists: ${employee[empNameCol]}`);
    } else {
      // Create new employee
      const insertData: any = {};
      insertData[empNameCol] = employeeName;

      const { data: newEmp, error: insertErr } = await supabase
        .from('employees')
        .insert([insertData])
        .select()
        .single();

      if (insertErr) {
        console.error("Error creating employee:", insertErr);
        return c.json({
          error: "Chyba pri vytváraní zamestnanca",
          details: insertErr.message,
          hint: `Pokúsil som sa vložiť do stĺpca "${empNameCol}"`
        }, 500);
      }

      employee = newEmp;
      console.log(`Employee created: ${employee[empNameCol]} (id: ${employee.id})`);
    }

    // 4. Find assignment column in tickets
    const assignCandidates = ['zakaznik', 'zamestnanec', 'employee', 'assigned_to', 'employee_name', 'assignee', 'handler'];
    const assignCol = pickColumn(tickColumns, assignCandidates);

    // 5. Find and update tickets
    const ticketResults: any[] = [];
    const employeeNameValue = employee[empNameCol] || employeeName;

    for (const ticketNum of targetTickets) {
      let foundTicket: any = null;

      // Try finding by common ID/number columns
      const idCandidates = ['id', 'ticket_id', 'number', 'ticket_number', 'cislo', 'num', 'code'];
      const idCols = tickColumns.filter(col =>
        idCandidates.some(k => col.toLowerCase().includes(k))
      );
      const colsToSearch = idCols.length > 0 ? idCols : ['id'];

      for (const col of colsToSearch) {
        try {
          const { data: found } = await supabase
            .from('tickets')
            .select('*')
            .eq(col, ticketNum)
            .limit(1);

          if (found && found.length > 0) {
            foundTicket = found[0];
            console.log(`Ticket ${ticketNum} found by column "${col}"`);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!foundTicket) {
        // Try cast as number too
        try {
          const numericId = parseInt(ticketNum);
          if (!isNaN(numericId)) {
            const { data: found } = await supabase
              .from('tickets')
              .select('*')
              .eq('id', numericId)
              .limit(1);
            if (found && found.length > 0) {
              foundTicket = found[0];
              console.log(`Ticket ${ticketNum} found by numeric id`);
            }
          }
        } catch (e) {
          // ignore
        }
      }

      if (foundTicket) {
        if (assignCol) {
          const updateData: any = {};
          updateData[assignCol] = employeeNameValue.toLowerCase();

          const { data: updated, error: updateErr } = await supabase
            .from('tickets')
            .update(updateData)
            .eq('id', foundTicket.id)
            .select()
            .single();

          if (updateErr) {
            ticketResults.push({
              ticketNumber: ticketNum,
              status: 'update_failed',
              error: updateErr.message,
              ticket: foundTicket
            });
          } else {
            ticketResults.push({
              ticketNumber: ticketNum,
              status: 'assigned',
              ticket: updated
            });
          }
        } else {
          ticketResults.push({
            ticketNumber: ticketNum,
            status: 'found_but_no_assign_column',
            ticket: foundTicket,
            warning: `Nebol nájdený stĺpec pre priradenie. Dostupné: ${tickColumns.join(', ')}`
          });
        }
      } else {
        ticketResults.push({
          ticketNumber: ticketNum,
          status: 'not_found',
          searchedColumns: colsToSearch
        });
      }
    }

    return c.json({
      success: true,
      employee: {
        ...employee,
        _nameColumn: empNameCol,
        _displayName: employeeNameValue
      },
      ticketResults,
      schema: {
        employees: empColumns,
        tickets: tickColumns,
        assignColumn: assignCol
      }
    });
  } catch (error) {
    console.error("Error in setup-employee:", error);
    return c.json({ error: "Setup zlyhal", details: String(error) }, 500);
  }
});

// ─── Create Ticket ────────────────────────────────────────────────────────────
app.post("/make-server-87f31c81/tickets", async (c) => {
  try {
    const body = await c.req.json();
    const { status, meno, email, opisProblemu, zakaznik } = body;

    const tickColumns = await getTableColumns('tickets');

    // Find the right column names
    const menoCol = pickColumn(tickColumns, ['meno', 'name', 'customer_name', 'client_name']) || 'meno';
    const emailCol = pickColumn(tickColumns, ['email', 'mail', 'email_address']) || 'email';
    const opisCol = pickColumn(tickColumns, ['opis_problemu', 'description', 'message', 'content', 'opis', 'problem']) || 'opis_problemu';
    const assignCol = pickColumn(tickColumns, ['zakaznik', 'zamestnanec', 'employee', 'assigned_to', 'employee_name']) || 'zakaznik';

    const insertData: any = {
      status: status || 'novy'
    };

    if (menoCol) insertData[menoCol] = meno;
    if (emailCol) insertData[emailCol] = email;
    if (opisCol) insertData[opisCol] = opisProblemu;
    if (assignCol) insertData[assignCol] = zakaznik?.toLowerCase();

    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error("Error creating ticket:", error);
      return c.json({ error: "Chyba pri vytváraní ticketu", details: error.message }, 500);
    }

    console.log(`Ticket created successfully: ${ticket.id}`);
    return c.json({ success: true, ticketId: ticket.id, ticket });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return c.json({ error: "Chyba pri vytváraní ticketu", details: String(error) }, 500);
  }
});

// ─── Update Ticket Status ─────────────────────────────────────────────────────
app.put("/make-server-87f31c81/tickets/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    const { data: ticket, error } = await supabase
      .from('tickets')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating ticket:", error);
      return c.json({ error: "Chyba pri aktualizácii ticketu", details: error.message }, 500);
    }

    if (!ticket) {
      return c.json({ error: "Ticket nenájdený" }, 404);
    }

    console.log(`Ticket updated successfully: ${id}`);
    return c.json({ success: true, ticket });
  } catch (error) {
    console.error("Error updating ticket:", error);
    return c.json({ error: "Chyba pri aktualizácii ticketu", details: String(error) }, 500);
  }
});

// ─── Get All Tickets ──────────────────────────────────────────────────────────
app.get("/make-server-87f31c81/tickets", async (c) => {
  try {
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching tickets:", error);
      return c.json({ error: "Chyba pri načítaní ticketov", details: error.message }, 500);
    }

    return c.json({ success: true, tickets: tickets || [] });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return c.json({ error: "Chyba pri načítaní ticketov", details: String(error) }, 500);
  }
});

// ─── Get All Employees ────────────────────────────────────────────────────────
app.get("/make-server-87f31c81/employees", async (c) => {
  try {
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*');

    if (error) {
      console.error("Error fetching employees:", error);
      return c.json({ error: "Chyba pri načítaní zamestnancov", details: error.message }, 500);
    }

    return c.json({ success: true, employees: employees || [] });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return c.json({ error: "Chyba pri načítaní zamestnancov", details: String(error) }, 500);
  }
});

// ─── AI helper functions ──────────────────────────────────────────────────────
function generateAIResponse(message: string, context?: any): any {
  const lowerMessage = message.toLowerCase();

  let requestType = "general";
  let priority = "medium";
  let suggestedActions: string[] = [];

  if (lowerMessage.includes("investor") || lowerMessage.includes("investícia") || lowerMessage.includes("funding")) {
    requestType = "finding_investor";
    priority = "high";
    suggestedActions = ["Schedule meeting with investment team", "Prepare pitch deck review"];
  } else if (lowerMessage.includes("employee") || lowerMessage.includes("zamestnanec") || lowerMessage.includes("hiring") || lowerMessage.includes("talent")) {
    requestType = "finding_employee";
    priority = "medium";
    suggestedActions = ["Connect with HR team", "Post job description"];
  } else if (lowerMessage.includes("event") || lowerMessage.includes("speaking") || lowerMessage.includes("konferencia")) {
    requestType = "speaking_event";
    priority = "low";
    suggestedActions = ["Contact events coordinator", "Check calendar availability"];
  } else if (lowerMessage.includes("marketing") || lowerMessage.includes("social media") || lowerMessage.includes("sociálne siete")) {
    requestType = "marketing_support";
    priority = "medium";
    suggestedActions = ["Forward to marketing team", "Review content calendar"];
  } else if (lowerMessage.includes("sales") || lowerMessage.includes("client") || lowerMessage.includes("klient")) {
    requestType = "sales_support";
    priority = "high";
    suggestedActions = ["Connect with sales team", "Schedule discovery call"];
  }

  const responses: Record<string, string> = {
    finding_investor: "Rozumiem, že hľadáte investora. Pomôžem vám spojiť sa s našimi investormi. Môžete mi prosím poskytnúť viac informácií o vašom projekte?",
    finding_employee: "Hľadáte nového zamestnanca. Náš HR tím vám môže pomôcť. Aké sú kľúčové požiadavky na pozíciu?",
    speaking_event: "Zaujímate sa o speaking príležitosť. Rád vás spojím s naším events koordinátorom. Aký typ eventu vás zaujíma?",
    marketing_support: "Potrebujete pomoc s marketingom. Náš marketing tím vám môže pomôcť so sociálnymi sieťami a obsahom.",
    sales_support: "Hľadáte podporu v oblasti predaja. Môžem vás spojiť s našim sales tímom pre ďalšie kroky.",
    general: "Ďakujem za vašu správu. Ako vám môžem pomôcť? Prosím, popíšte vašu požiadavku a ja ju správne kategorizujem."
  };

  return {
    message: responses[requestType],
    detectedType: requestType,
    suggestedPriority: priority,
    suggestedActions,
    followUpQuestions: getFollowUpQuestions(requestType)
  };
}

function getFollowUpQuestions(requestType: string): string[] {
  const questions: Record<string, string[]> = {
    finding_investor: ["Aké je vývojové štádium vášho startupu?", "Akú výšku investície hľadáte?", "V akom sektore pôsobíte?"],
    finding_employee: ["Aká je požadovaná pozícia?", "Aké sú kľúčové zručnosti?", "Kedy potrebujete zamestnanca nastúpiť?"],
    speaking_event: ["Aký typ eventu organizujete?", "Kedy sa event koná?", "Aká je očakávaná veľkosť publika?"],
    marketing_support: ["Na akých platformách potrebujete podporu?", "Aký typ obsahu chcete zdieľať?", "Aký je váš cieľ kampane?"],
    sales_support: ["Kto je vaša cieľová skupina?", "Aký produkt alebo službu ponúkate?", "V akej fáze predajného procesu potrebujete pomoc?"],
    general: ["Môžete popísať vašu požiadavku detailnejšie?", "Aký je váš časový rámec?", "S kým by ste sa chceli spojiť?"]
  };
  return questions[requestType] || questions.general;
}

function suggestTeamMembers(requestType: string, description: string): any[] {
  const suggestions: Record<string, any[]> = {
    finding_investor: [
      { name: "Investment Director", role: "Lead Investor Relations", matchScore: 95 },
      { name: "Portfolio Manager", role: "Investment Analysis", matchScore: 85 }
    ],
    finding_employee: [
      { name: "HR Manager", role: "Talent Acquisition", matchScore: 90 },
      { name: "Recruitment Specialist", role: "HR Team", matchScore: 80 }
    ],
    speaking_event: [
      { name: "Events Coordinator", role: "Community Relations", matchScore: 95 },
      { name: "Marketing Manager", role: "Brand & Communications", matchScore: 75 }
    ],
    marketing_support: [
      { name: "Marketing Manager", role: "Brand & Communications", matchScore: 95 },
      { name: "Social Media Specialist", role: "Digital Marketing", matchScore: 90 }
    ],
    sales_support: [
      { name: "Sales Director", role: "Business Development", matchScore: 95 },
      { name: "Account Manager", role: "Client Relations", matchScore: 85 }
    ]
  };
  return suggestions[requestType] || [{ name: "General Manager", role: "Operations", matchScore: 70 }];
}

Deno.serve(app.fetch);