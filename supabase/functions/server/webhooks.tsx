// Example webhook handlers for social media integrations
// These would be added to the server as additional routes

import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const webhookApp = new Hono();

// Instagram Webhook Handler
webhookApp.get("/make-server-87f31c81/webhooks/instagram", (c) => {
  // Webhook verification for Instagram
  const mode = c.req.query("hub.mode");
  const token = c.req.query("hub.verify_token");
  const challenge = c.req.query("hub.challenge");

  const VERIFY_TOKEN = Deno.env.get("INSTAGRAM_VERIFY_TOKEN") || "your_verify_token";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Instagram webhook verified");
    return c.text(challenge || "");
  }

  return c.json({ error: "Forbidden" }, 403);
});

webhookApp.post("/make-server-87f31c81/webhooks/instagram", async (c) => {
  try {
    const body = await c.req.json();
    console.log("Instagram webhook received:", JSON.stringify(body));

    // Process Instagram message
    if (body.object === "instagram") {
      for (const entry of body.entry) {
        for (const messaging of entry.messaging || []) {
          if (messaging.message) {
            const senderId = messaging.sender.id;
            const messageText = messaging.message.text;

            // Create request from Instagram message
            const requestId = `request_instagram_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const timestamp = new Date().toISOString();

            const request = {
              id: requestId,
              name: `Instagram User ${senderId}`,
              email: `instagram_${senderId}@placeholder.com`,
              userType: "community_member",
              requestType: detectRequestType(messageText),
              description: messageText,
              priority: "medium",
              company: "",
              source: "instagram",
              status: "pending",
              assignedTo: null,
              createdAt: timestamp,
              updatedAt: timestamp,
              resolved: false,
              valueDelivered: null,
              notes: []
            };

            await kv.set(requestId, request);

            // Add to all_requests list
            const allRequests = await kv.get("all_requests") || { ids: [] };
            allRequests.ids.unshift(requestId);
            await kv.set("all_requests", allRequests);

            console.log(`Request created from Instagram: ${requestId}`);

            // TODO: Send response back to Instagram user
            // This requires Instagram Graph API call with page access token
          }
        }
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Instagram webhook error:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// Facebook Messenger Webhook Handler
webhookApp.get("/make-server-87f31c81/webhooks/facebook", (c) => {
  const mode = c.req.query("hub.mode");
  const token = c.req.query("hub.verify_token");
  const challenge = c.req.query("hub.challenge");

  const VERIFY_TOKEN = Deno.env.get("FACEBOOK_VERIFY_TOKEN") || "your_verify_token";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Facebook webhook verified");
    return c.text(challenge || "");
  }

  return c.json({ error: "Forbidden" }, 403);
});

webhookApp.post("/make-server-87f31c81/webhooks/facebook", async (c) => {
  try {
    const body = await c.req.json();
    console.log("Facebook webhook received:", JSON.stringify(body));

    if (body.object === "page") {
      for (const entry of body.entry) {
        for (const messaging of entry.messaging || []) {
          if (messaging.message) {
            const senderId = messaging.sender.id;
            const messageText = messaging.message.text;

            const requestId = `request_facebook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const timestamp = new Date().toISOString();

            const request = {
              id: requestId,
              name: `Facebook User ${senderId}`,
              email: `facebook_${senderId}@placeholder.com`,
              userType: "community_member",
              requestType: detectRequestType(messageText),
              description: messageText,
              priority: "medium",
              company: "",
              source: "facebook",
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

            console.log(`Request created from Facebook: ${requestId}`);
          }
        }
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Facebook webhook error:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// Discord Webhook Handler
webhookApp.post("/make-server-87f31c81/webhooks/discord", async (c) => {
  try {
    const body = await c.req.json();
    console.log("Discord webhook received:", JSON.stringify(body));

    // Handle Discord interactions
    if (body.type === 1) {
      // Ping response
      return c.json({ type: 1 });
    }

    if (body.type === 2) {
      // Application command
      const commandName = body.data.name;

      if (commandName === "submit-request") {
        const options = body.data.options || [];
        const requestType = options.find((o: any) => o.name === "type")?.value || "other";
        const description = options.find((o: any) => o.name === "description")?.value || "";
        const userName = body.member?.user?.username || "Unknown";

        const requestId = `request_discord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = new Date().toISOString();

        const request = {
          id: requestId,
          name: userName,
          email: `discord_${userName}@placeholder.com`,
          userType: "community_member",
          requestType: requestType,
          description: description,
          priority: "medium",
          company: "",
          source: "discord",
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

        console.log(`Request created from Discord: ${requestId}`);

        return c.json({
          type: 4,
          data: {
            content: `✅ Vaša žiadosť bola úspešne odoslaná! ID: ${requestId}`,
            flags: 64 // Ephemeral message
          }
        });
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Discord webhook error:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// Helper function to detect request type from message
function detectRequestType(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("investor") || lowerMessage.includes("investícia") || lowerMessage.includes("funding")) {
    return "finding_investor";
  } else if (lowerMessage.includes("employee") || lowerMessage.includes("zamestnanec") || lowerMessage.includes("hiring")) {
    return "finding_employee";
  } else if (lowerMessage.includes("event") || lowerMessage.includes("speaking")) {
    return "speaking_event";
  } else if (lowerMessage.includes("marketing") || lowerMessage.includes("social")) {
    return "marketing_support";
  } else if (lowerMessage.includes("sales") || lowerMessage.includes("client") || lowerMessage.includes("klient")) {
    return "sales_support";
  }

  return "other";
}

// Notion Sync Handler (to be called periodically or on demand)
webhookApp.post("/make-server-87f31c81/sync/notion", async (c) => {
  try {
    const NOTION_API_KEY = Deno.env.get("NOTION_API_KEY");
    const NOTION_DATABASE_ID = Deno.env.get("NOTION_DATABASE_ID");

    if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
      return c.json({ error: "Notion credentials not configured" }, 400);
    }

    // Get all requests
    const allRequests = await kv.get("all_requests") || { ids: [] };
    const requests = [];

    for (const id of allRequests.ids) {
      const request = await kv.get(id);
      if (request) {
        requests.push(request);
      }
    }

    // Sync to Notion (this is a simplified example)
    // In production, you would:
    // 1. Check if page already exists in Notion
    // 2. Update existing pages or create new ones
    // 3. Handle bi-directional sync

    let syncedCount = 0;
    for (const request of requests) {
      try {
        const response = await fetch("https://api.notion.com/v1/pages", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${NOTION_API_KEY}`,
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
          },
          body: JSON.stringify({
            parent: { database_id: NOTION_DATABASE_ID },
            properties: {
              "Name": { title: [{ text: { content: request.name } }] },
              "Email": { email: request.email },
              "Type": { select: { name: request.requestType } },
              "Priority": { select: { name: request.priority } },
              "Status": { select: { name: request.status } },
              "Description": { rich_text: [{ text: { content: request.description } }] }
            }
          })
        });

        if (response.ok) {
          syncedCount++;
        }
      } catch (error) {
        console.error(`Error syncing request ${request.id} to Notion:`, error);
      }
    }

    console.log(`Synced ${syncedCount} requests to Notion`);
    return c.json({ success: true, syncedCount });
  } catch (error) {
    console.error("Notion sync error:", error);
    return c.json({ error: String(error) }, 500);
  }
});

export { webhookApp };
