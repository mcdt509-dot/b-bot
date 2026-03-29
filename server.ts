import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Stripe from "stripe";
import fs from "fs/promises";

dotenv.config();
// ... (rest of the imports)

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock initial programs data
  let programs = [
    { id: '1', name: 'Google VRP', platform: 'Private', rewardRange: [100, 31337], severity: 'Critical', category: 'Web/Cloud', updatedAt: '1h ago' },
    { id: '2', name: 'Shopify', platform: 'HackerOne', rewardRange: [500, 50000], severity: 'Critical', category: 'E-commerce', updatedAt: '3h ago' },
    { id: '3', name: 'Meta Bug Bounty', platform: 'Private', rewardRange: [500, 45000], severity: 'High', category: 'Social', updatedAt: '5h ago' },
    { id: '4', name: 'Tesla', platform: 'Bugcrowd', rewardRange: [100, 15000], severity: 'High', category: 'Automotive', updatedAt: '12h ago' },
    { id: '5', name: 'Airbnb', platform: 'HackerOne', rewardRange: [200, 20000], severity: 'High', category: 'Travel', updatedAt: '1d ago' },
    { id: '6', name: 'Twitch', platform: 'Bugcrowd', rewardRange: [100, 10000], severity: 'Medium', category: 'Streaming', updatedAt: '2d ago' },
    { id: '7', name: 'Uber', platform: 'HackerOne', rewardRange: [500, 30000], severity: 'High', category: 'Transportation', updatedAt: '2d ago' },
    { id: '8', name: 'Slack', platform: 'HackerOne', rewardRange: [100, 10000], severity: 'Medium', category: 'Communication', updatedAt: '3d ago' },
    { id: '9', name: 'Dropbox', platform: 'HackerOne', rewardRange: [200, 25000], severity: 'High', category: 'Cloud Storage', updatedAt: '3d ago' },
    { id: '10', name: 'GitHub', platform: 'HackerOne', rewardRange: [500, 30000], severity: 'Critical', category: 'Development', updatedAt: '4d ago' },
    { id: '11', name: 'Spotify', platform: 'HackerOne', rewardRange: [250, 15000], severity: 'High', category: 'Music', updatedAt: '4d ago' },
    { id: '12', name: 'Netflix', platform: 'Bugcrowd', rewardRange: [100, 20000], severity: 'High', category: 'Entertainment', updatedAt: '5d ago' },
    { id: '13', name: 'Discord', platform: 'HackerOne', rewardRange: [500, 30000], severity: 'Critical', category: 'Communication', updatedAt: 'Just now' },
  ];

  // API Routes
  app.get("/api/programs", (req, res) => {
    res.json(programs);
  });

  app.post("/api/programs", (req, res) => {
    const newProgram = {
      ...req.body,
      id: Math.random().toString(36).substr(2, 9),
      updatedAt: 'Just now'
    };
    programs = [newProgram, ...programs];
    res.status(201).json(newProgram);
  });

  // Stripe initialization
  const stripe = process.env.STRIPE_SECRET_KEY 
    ? new Stripe(process.env.STRIPE_SECRET_KEY) 
    : null;

  // API Routes
  app.get("/api/stripe/balance", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }
    try {
      const balance = await stripe.balance.retrieve();
      res.json(balance);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/stripe/payouts", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }
    try {
      const payouts = await stripe.payouts.list({ limit: 10 });
      res.json(payouts.data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/withdraw", async (req, res) => {
    const { amount, destination } = req.body;

    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured on the server." });
    }

    try {
      // Create a payout to the default external account
      const payout = await stripe.payouts.create({
        amount: Math.round(amount * 100), // amount in cents
        currency: "usd",
        statement_descriptor: "BOUNTYBOT",
      });

      res.json({ success: true, payoutId: payout.id });
    } catch (error: any) {
      console.error("Stripe Withdrawal Error:", error);
      
      let userMessage = error.message;
      if (error.code === 'external_account_not_found' || error.message.includes('external accounts')) {
        userMessage = "No bank account or debit card found on your Stripe account. Please add an external account in your Stripe Dashboard.";
      } else if (error.code === 'balance_insufficient') {
        userMessage = "Insufficient funds in your Stripe balance for this withdrawal.";
      }

      res.status(400).json({ error: userMessage });
    }
  });

  app.post("/api/settings/save-config", async (req, res) => {
    const { stripeKey } = req.body;
    
    try {
      const envPath = path.join(process.cwd(), ".env");
      let content = "";
      
      try {
        content = await fs.readFile(envPath, "utf-8");
      } catch (e) {
        // .env might not exist yet
      }

      const lines = content.split("\n");
      const newLines = lines.filter(line => !line.startsWith("STRIPE_SECRET_KEY="));
      newLines.push(`STRIPE_SECRET_KEY="${stripeKey}"`);
      
      await fs.writeFile(envPath, newLines.join("\n"), "utf-8");
      
      res.json({ success: true, message: "Settings saved to .env. Please restart the server to apply changes." });
    } catch (error: any) {
      console.error("Save Settings Error:", error);
      res.status(500).json({ error: "Failed to save settings." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
