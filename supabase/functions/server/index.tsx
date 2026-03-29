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

// Health check endpoint
app.get("/make-server-87f31c81/health", (c) => {
  return c.json({ status: "ok" });
});

// Submit a new request
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

    // Also store in a list for easy retrieval
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

// Get all requests
app.get("/make-server-87f31c81/requests", async (c) => {
  try {
    const allRequests = await kv.get("all_requests") || { ids: [] };
    const requests = [];

    for (const id of allRequests.ids) {
      const request = await kv.get(id);
      if (request) {
        requests.push(request);
      }
    }

    return c.json({ success: true, requests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return c.json({ error: "Failed to fetch requests", details: String(error) }, 500);
  }
});

// Get a single request
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

// Update a request
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

// AI Chatbot endpoint - categorize and prioritize
app.post("/make-server-87f31c81/chatbot", async (c) => {
  try {
    const body = await c.req.json();
    const { message, context } = body;

    if (!message) {
      return c.json({ error: "Message is required" }, 400);
    }

    // Simulate AI response based on keywords
    const response = generateAIResponse(message, context);

    return c.json({ success: true, response });
  } catch (error) {
    console.error("Error in chatbot:", error);
    return c.json({ error: "Chatbot error", details: String(error) }, 500);
  }
});

// Matchmaking - suggest team members
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

// Get team members
app.get("/make-server-87f31c81/team", async (c) => {
  try {
    const team = await kv.get("team_members") || { members: [] };
    return c.json({ success: true, team: team.members });
  } catch (error) {
    console.error("Error fetching team:", error);
    return c.json({ error: "Failed to fetch team", details: String(error) }, 500);
  }
});

// Add team member
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

// Helper function to generate AI response
function generateAIResponse(message: string, context?: any): any {
  const lowerMessage = message.toLowerCase();
  
  // Detect request type
  let requestType = "general";
  let priority = "medium";
  let suggestedActions = [];

  if (lowerMessage.includes("investor") || lowerMessage.includes("investícia") || lowerMessage.includes("funding")) {
    requestType = "finding_investor";
    priority = "high";
    suggestedActions = ["Schedule meeting with investment team", "Prepare pitch deck review"];
  } else if (lowerMessage.includes("employee") || lowerMessage.includes("zamestnanec") || lowerMessage.includes("hiring") || lowerMessage.includes("talent")) {
    requestType = "finding_employee";
    priority = "medium";
    suggestedActions = ["Connect with HR team", "Post job description"];
  } else if (lowerMessage.includes("event") || lowerMessage.includes("speaking") || lowerMessage.includes("speaking") || lowerMessage.includes("konferencia")) {
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

  const responses = {
    finding_investor: "Rozumiem, že hľadáte investora. Pomôžem vám spojiť sa s našimi investormi. Môžete mi prosím poskytnúť viac informácií o vašom projekte?",
    finding_employee: "Hľadáte nového zamestnanca. Náš HR tím vám môže pomôcť. Aké sú kľúčové požiadavky na pozíciu?",
    speaking_event: "Zaujímate sa o speaking príležitosť. Rád vás spojím s naším events koordinátorom. Aký typ eventu vás zaujíma?",
    marketing_support: "Potrebujete pomoc s marketingom. Náš marketing tím vám môže pomôcť so sociálnymi sieťami a obsahom.",
    sales_support: "Hľadáte podporu v oblasti predaja. Môžem vás spojiť s našim sales tímom pre ďalšie kroky.",
    general: "Ďakujem za vašu správu. Ako vám môžem pomôcť? Prosím, popíšte vašu požiadavku a ja ju správne kategorizujem."
  };

  return {
    message: responses[requestType as keyof typeof responses],
    detectedType: requestType,
    suggestedPriority: priority,
    suggestedActions,
    followUpQuestions: getFollowUpQuestions(requestType)
  };
}

// Helper function to get follow-up questions
function getFollowUpQuestions(requestType: string): string[] {
  const questions: Record<string, string[]> = {
    finding_investor: [
      "Aké je vývojové štádium vášho startupu?",
      "Akú výšku investície hľadáte?",
      "V akom sektore pôsobíte?"
    ],
    finding_employee: [
      "Aká je požadovaná pozícia?",
      "Aké sú kľúčové zručnosti?",
      "Kedy potrebujete zamestnanca nastúpiť?"
    ],
    speaking_event: [
      "Aký typ eventu organizujete?",
      "Kedy sa event koná?",
      "Aká je očakávaná veľkosť publika?"
    ],
    marketing_support: [
      "Na akých platformách potrebujete podporu?",
      "Aký typ obsahu chcete zdieľať?",
      "Aký je váš cieľ kampane?"
    ],
    sales_support: [
      "Kto je vaša cieľová skupina?",
      "Aký produkt alebo službu ponúkate?",
      "V akej fáze predajného procesu potrebujete pomoc?"
    ],
    general: [
      "Môžete popísať vašu požiadavku detailnejšie?",
      "Aký je váš časový rámec?",
      "S kým by ste sa chceli spojiť?"
    ]
  };

  return questions[requestType] || questions.general;
}

// Helper function to suggest team members
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

  return suggestions[requestType] || [
    { name: "General Manager", role: "Operations", matchScore: 70 }
  ];
}

// Employee Login
app.post("/make-server-87f31c81/employee/login", async (c) => {
  try {
    const body = await c.req.json();
    const { name } = body;

    if (!name) {
      return c.json({ error: "Meno je povinné" }, 400);
    }

    const normalizedName = name.trim().toLowerCase();
    
    // Only look up existing employees - do NOT create new ones
    const { data: employee, error: selectError } = await supabase
      .from('employees')
      .select('*')
      .ilike('name', normalizedName)
      .single();

    if (selectError || !employee) {
      console.log(`Employee not found: ${normalizedName}`);
      return c.json({ error: "Zamestnanec s týmto menom nebol nájdený" }, 404);
    }

    return c.json({ 
      success: true, 
      employee: {
        id: employee.id,
        name: employee.name,
        normalizedName: (employee.normalized_name || employee.name).toLowerCase()
      }
    });
  } catch (error) {
    console.error("Error during employee login:", error);
    return c.json({ error: "Chyba pri prihlásení", details: String(error) }, 500);
  }
});

// Customer Login - find customer by name from tickets table
app.post("/make-server-87f31c81/customer/login", async (c) => {
  try {
    const body = await c.req.json();
    const { name } = body;

    if (!name) {
      return c.json({ error: "Meno je povinné" }, 400);
    }

    const normalizedName = name.trim().toLowerCase();
    
    // Look up customer from tickets table
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('*')
      .ilike('meno', normalizedName)
      .limit(1);

    if (error || !tickets || tickets.length === 0) {
      console.log(`Customer not found in tickets: ${normalizedName}`);
      return c.json({ error: "Zákazník s týmto menom nebol nájdený v systéme" }, 404);
    }

    return c.json({ 
      success: true, 
      customer: {
        name: tickets[0].meno,
        email: tickets[0].email
      }
    });
  } catch (error) {
    console.error("Error during customer login:", error);
    return c.json({ error: "Chyba pri prihlásení zákazníka", details: String(error) }, 500);
  }
});

// Get Customer Tickets by name
app.get("/make-server-87f31c81/customer/:name/tickets", async (c) => {
  try {
    const name = c.req.param("name");
    const normalizedName = decodeURIComponent(name).trim().toLowerCase();
    
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('*')
      .ilike('meno', normalizedName)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching customer tickets:", error);
      return c.json({ error: "Chyba pri načítaní ticketov zákazníka", details: error.message }, 500);
    }

    return c.json({ success: true, tickets: tickets || [] });
  } catch (error) {
    console.error("Error fetching customer tickets:", error);
    return c.json({ error: "Chyba pri načítaní ticketov zákazníka", details: String(error) }, 500);
  }
});

// Get Employee Tickets
app.get("/make-server-87f31c81/employee/:name/tickets", async (c) => {
  try {
    const name = c.req.param("name");
    const normalizedName = name.trim().toLowerCase();
    
    // Get all tickets for this employee from Supabase
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('zakaznik', normalizedName)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching tickets:", error);
      return c.json({ error: "Chyba pri načítaní ticketov", details: error.message }, 500);
    }

    return c.json({ success: true, tickets: tickets || [] });
  } catch (error) {
    console.error("Error fetching employee tickets:", error);
    return c.json({ error: "Chyba pri načítaní ticketov", details: String(error) }, 500);
  }
});

// Create Ticket
app.post("/make-server-87f31c81/tickets", async (c) => {
  try {
    const body = await c.req.json();
    const { status, meno, email, opisProblemu, zakaznik } = body;

    if (!meno || !email || !opisProblemu || !zakaznik) {
      return c.json({ error: "Všetky polia sú povinné" }, 400);
    }

    const normalizedZakaznik = zakaznik.trim().toLowerCase();

    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert([
        {
          status: status || 'novy',
          meno,
          email,
          opis_problemu: opisProblemu,
          zakaznik: normalizedZakaznik,
        }
      ])
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

// Update Ticket Status
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

// Get All Tickets
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

// Get All Employees
app.get("/make-server-87f31c81/employees", async (c) => {
  try {
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

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

Deno.serve(app.fetch);