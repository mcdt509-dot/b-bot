import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Stripe from "stripe";
import fs from "fs/promises";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

  app.use(express.json());

  // Global Request Logging
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`[GLOBAL API] ${req.method} ${req.url}`);
    }
    next();
  });

  const apiRouter = express.Router();

  // Mount the API router early
  app.use("/api", apiRouter);

  // Stripe initialization
  let stripe: Stripe | null = null;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  
  if (stripeSecretKey) {
    if (stripeSecretKey.startsWith('sk_')) {
      stripe = new Stripe(stripeSecretKey);
    } else {
      console.error("[Stripe] STRIPE_SECRET_KEY must be a secret key (starting with 'sk_'). Provided key starts with:", stripeSecretKey.substring(0, 3));
    }
  }

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

  let activeJobs: any[] = [];
  let mockBalance = { available: 125000, pending: 0 }; // in cents
  let mockTransactions: any[] = [
    { id: 'tx_1', type: 'payout', amount: 5000, status: 'completed', date: new Date(Date.now() - 86400000).toISOString(), description: 'Bounty Payout' },
    { id: 'tx_2', type: 'reward', amount: 1000, status: 'completed', date: new Date(Date.now() - 172800000).toISOString(), description: 'Critical Vulnerability Reward' },
  ];
  let globalStats = {
    vulnsFound: 38,
    completedMissions: 124
  };

  // Simulate progress
  const simulateProgress = async (jobId: string) => {
    try {
      const statuses = ['Scanning', 'Analyzing', 'Exploiting', 'Completed'];
      for (let i = 0; i < statuses.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 5000));
        const job = activeJobs.find(j => j.id === jobId);
        if (!job) break;
        
        job.status = statuses[i];
        job.progress = (i + 1) * 25;
        
        if (job.status === 'Completed') {
          const vulns = ['Stored XSS', 'SQL Injection', 'IDOR', 'SSRF', 'RCE'];
          const severities = ['Low', 'Medium', 'High', 'Critical'];
          job.vulnerabilityFound = vulns[Math.floor(Math.random() * vulns.length)];
          job.severity = severities[Math.floor(Math.random() * severities.length)];
          
          let cvss = 0;
          if (job.severity === 'Critical') cvss = 9.0 + Math.random() * 1.0;
          else if (job.severity === 'High') cvss = 7.0 + Math.random() * 1.9;
          else if (job.severity === 'Medium') cvss = 4.0 + Math.random() * 2.9;
          else cvss = 0.1 + Math.random() * 3.8;
          
          job.cvss = parseFloat(cvss.toFixed(1));
          const baseReward = job.severity === 'Critical' ? 5000 : job.severity === 'High' ? 1000 : job.severity === 'Medium' ? 500 : 100;
          const rewardAmount = Math.round(baseReward * (job.cvss / 5));
          
          job.rewardAmount = rewardAmount;
          mockBalance.pending += rewardAmount * 100;
          
          globalStats.vulnsFound++;
          globalStats.completedMissions++;
        }
      }
    } catch (error) {
      console.error(`Error in simulateProgress for job ${jobId}:`, error);
    }
  };

  // API Routes
  apiRouter.get("/programs", (req, res, next) => {
    try {
      res.json(programs);
    } catch (error) {
      next(error);
    }
  });

  apiRouter.post("/programs", (req, res, next) => {
    try {
      const newProgram = {
        ...req.body,
        id: Math.random().toString(36).substr(2, 9),
        updatedAt: 'Just now'
      };
      programs = [newProgram, ...programs];
      res.status(201).json(newProgram);
    } catch (error) {
      next(error);
    }
  });

  apiRouter.get("/jobs", (req, res, next) => {
    try {
      res.json(activeJobs);
    } catch (error) {
      next(error);
    }
  });

  apiRouter.post("/jobs", (req, res, next) => {
    try {
      const { programId, programName } = req.body;
      const newJob = {
        id: Math.random().toString(36).substr(2, 9),
        programId,
        programName,
        status: 'Initializing',
        progress: 0,
        startedAt: new Date().toISOString(),
        claimed: false,
      };
      activeJobs = [newJob, ...activeJobs];
      
      simulateProgress(newJob.id).catch(err => console.error("simulateProgress unhandled error:", err));
      res.status(201).json(newJob);
    } catch (error) {
      next(error);
    }
  });

  apiRouter.delete("/jobs/:id", (req, res, next) => {
    try {
      activeJobs = activeJobs.filter(j => j.id !== req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  apiRouter.post("/jobs/:id/claim", (req, res, next) => {
    try {
      const jobIndex = activeJobs.findIndex(j => j.id === req.params.id);
      if (jobIndex === -1) return res.status(404).json({ error: "Job not found" });
      
      const job = activeJobs[jobIndex];
      if (job.status !== 'Completed') return res.status(400).json({ error: "Job not completed" });
      if (job.claimed) return res.status(400).json({ error: "Reward already claimed" });

      const rewardAmount = job.rewardAmount || 0;
      
      job.claimed = true;
      mockBalance.pending -= rewardAmount * 100;
      mockBalance.available += rewardAmount * 100;
      
      mockTransactions.unshift({
        id: `tx_${Math.random().toString(36).substr(2, 9)}`,
        type: 'reward',
        amount: rewardAmount * 100,
        status: 'completed',
        date: new Date().toISOString(),
        description: `Reward: ${job.vulnerabilityFound} (${job.severity})`
      });

      res.json({ success: true, amount: rewardAmount });
    } catch (error) {
      next(error);
    }
  });

  apiRouter.get("/stats", (req, res, next) => {
    try {
      res.json(globalStats);
    } catch (error) {
      next(error);
    }
  });

  const threatFeed = [
    { id: 1, type: 'APT', title: 'Lazarus Group Activity Detected', description: 'Increased scanning activity targeting financial institutions in SE Asia.', severity: 'High', timestamp: new Date().toISOString() },
    { id: 2, type: 'Malware', title: 'New Emotet Variant', description: 'Polymorphic payload detected in recent phishing campaigns.', severity: 'Critical', timestamp: new Date().toISOString() },
    { id: 3, type: 'Vulnerability', title: 'Zero-Day in popular VPN', description: 'Unauthenticated RCE vulnerability discovered in major enterprise VPN software.', severity: 'Critical', timestamp: new Date().toISOString() },
    { id: 4, type: 'DDoS', title: 'Large Scale Botnet Mobilization', description: 'Mirai-based botnet observed performing massive SYN flood attacks.', severity: 'Medium', timestamp: new Date().toISOString() },
    { id: 5, type: 'Leak', title: 'Major Database Dump on DarkWeb', description: 'Credentials for 50M+ users leaked from a major social media platform.', severity: 'High', timestamp: new Date().toISOString() },
  ];

  let liveThreats = [...threatFeed];

  // Periodically generate new threats if Gemini is available
  const rawApiKey = process.env.GEMINI_API_KEY;
  const isPlaceholderKey = rawApiKey === "MY_GEMINI_API_KEY" || !rawApiKey;
  const genAI = !isPlaceholderKey ? new GoogleGenAI({ apiKey: rawApiKey }) : null;
  
  const updateLiveThreats = async () => {
    if (!genAI) {
      if (isPlaceholderKey && rawApiKey) {
        console.warn("[Gemini] Using placeholder API key. AI threat generation disabled.");
      }
      return;
    }
    try {
      const prompt = "Generate 3 realistic, brief cybersecurity threat alerts for a live dashboard. Return as a JSON array of objects with fields: id (random number), type (e.g. APT, Malware, DDoS), title, description, severity (Low, Medium, High, Critical), timestamp (ISO string).";
      
      const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });
      
      const text = result.text || "";
      const jsonMatch = text.match(/\[.*\]/s);
      if (jsonMatch) {
        const newThreats = JSON.parse(jsonMatch[0]);
        liveThreats = [...newThreats, ...liveThreats].slice(0, 10);
        console.log(`[${new Date().toISOString()}] Live threats updated via AI`);
      }
    } catch (error) {
      console.error("Failed to update live threats via AI:", error);
    }
  };

  // Update every 2 minutes
  if (genAI) {
    setInterval(updateLiveThreats, 120000);
    updateLiveThreats(); // Initial update
  }

  apiRouter.get("/threats", (req, res, next) => {
    try {
      const shuffled = [...liveThreats].sort(() => 0.5 - Math.random());
      res.json(shuffled.slice(0, 4));
    } catch (error) {
      next(error);
    }
  });

  apiRouter.get("/transactions", async (req, res, next) => {
    try {
      let stripeTransactions: any[] = [];
      if (stripe) {
        try {
          const payouts = await stripe.payouts.list({ limit: 20 });
          stripeTransactions = payouts.data.map(p => ({
            id: p.id,
            type: 'payout',
            amount: p.amount,
            status: p.status === 'paid' ? 'completed' : 'pending',
            date: new Date(p.created * 1000).toISOString(),
            description: 'Stripe Payout'
          }));
        } catch (stripeErr: any) {
          console.error("[Stripe] Failed to fetch payouts:", stripeErr.message);
          if (stripeErr.type === 'StripePermissionError') {
            // Don't throw, just log and continue with mock data
            console.warn("[Stripe] Permission error: Ensure you are using a SECRET key (sk_...), not a publishable key (pk_...).");
          } else {
            throw stripeErr;
          }
        }
      }
      
      const allTransactions = [...mockTransactions, ...stripeTransactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      res.json(allTransactions);
    } catch (error: any) {
      next(error);
    }
  });

  apiRouter.get("/stripe/balance", async (req, res, next) => {
    try {
      let available = mockBalance.available;
      let pending = mockBalance.pending;

      if (stripe) {
        try {
          const balance = await stripe.balance.retrieve();
          available += balance.available.reduce((acc, b) => acc + b.amount, 0);
          pending += balance.pending.reduce((acc, b) => acc + b.amount, 0);
        } catch (stripeErr: any) {
          console.error("[Stripe] Failed to fetch balance:", stripeErr.message);
          if (stripeErr.type !== 'StripePermissionError') {
            throw stripeErr;
          }
        }
      }

      res.json({
        available: [{ amount: available, currency: 'usd' }],
        pending: [{ amount: pending, currency: 'usd' }]
      });
    } catch (error: any) {
      next(error);
    }
  });

  apiRouter.get("/stripe/payouts", async (req, res, next) => {
    if (!stripe) return res.status(500).json({ error: "Stripe not configured or invalid key" });
    try {
      const payouts = await stripe.payouts.list({ limit: 10 });
      res.json(payouts.data);
    } catch (error: any) {
      if (error.type === 'StripePermissionError') {
        console.error("[Stripe] Permission error in payouts:", error.message);
        return res.status(403).json({ error: "Stripe permission error. Ensure you are using a SECRET key (sk_...)." });
      }
      next(error);
    }
  });

  apiRouter.post("/withdraw", async (req, res, next) => {
    const { amount } = req.body;
    const amountInCents = Math.round(amount * 100);

    if (amountInCents > mockBalance.available && !stripe) {
      return res.status(400).json({ error: "Insufficient funds in your BountyBot balance." });
    }

    try {
      if (amountInCents <= mockBalance.available) {
        mockBalance.available -= amountInCents;
        mockTransactions.unshift({
          id: `tx_${Math.random().toString(36).substr(2, 9)}`,
          type: 'payout',
          amount: amountInCents,
          status: 'completed',
          date: new Date().toISOString(),
          description: 'BountyBot Withdrawal'
        });
        return res.json({ success: true, payoutId: `mock_${Math.random().toString(36).substr(2, 9)}` });
      }

      if (stripe) {
        try {
          const payout = await stripe.payouts.create({
            amount: amountInCents,
            currency: "usd",
            statement_descriptor: "BOUNTYBOT",
          });
          return res.json({ success: true, payoutId: payout.id });
        } catch (stripeErr: any) {
          console.error("[Stripe] Withdrawal failed:", stripeErr.message);
          if (stripeErr.type === 'StripePermissionError') {
            return res.status(403).json({ error: "Stripe permission error. Ensure you are using a SECRET key (sk_...)." });
          }
          throw stripeErr;
        }
      }

      res.status(400).json({ error: "Insufficient funds." });
    } catch (error: any) {
      next(error);
    }
  });

  apiRouter.get("/settings/config", async (req, res, next) => {
    try {
      const envPath = path.join(process.cwd(), ".env");
      let content = "";
      try {
        content = await fs.readFile(envPath, "utf-8");
      } catch (e) {}

      const lines = content.split("\n");
      const stripeKeyLine = lines.find(line => line.startsWith("STRIPE_SECRET_KEY="));
      const stripePubKeyLine = lines.find(line => line.startsWith("STRIPE_PUBLISHABLE_KEY="));
      const stripeMerchantKeyLine = lines.find(line => line.startsWith("STRIPE_MERCHANT_KEY="));
      const stripeWebhookSecretLine = lines.find(line => line.startsWith("STRIPE_WEBHOOK_SECRET="));
      const customApiKeyLine = lines.find(line => line.startsWith("CUSTOM_API_KEY="));

      const stripeKey = stripeKeyLine ? stripeKeyLine.split("=")[1].replace(/"/g, "").trim() : "";
      const stripePubKey = stripePubKeyLine ? stripePubKeyLine.split("=")[1].replace(/"/g, "").trim() : "";
      const stripeMerchantKey = stripeMerchantKeyLine ? stripeMerchantKeyLine.split("=")[1].replace(/"/g, "").trim() : "";
      const stripeWebhookSecret = stripeWebhookSecretLine ? stripeWebhookSecretLine.split("=")[1].replace(/"/g, "").trim() : "";
      const customApiKey = customApiKeyLine ? customApiKeyLine.split("=")[1].replace(/"/g, "").trim() : "";

      res.json({ stripeKey, stripePubKey, stripeMerchantKey, stripeWebhookSecret, customApiKey });
    } catch (error) {
      next(error);
    }
  });

  apiRouter.post("/settings/save-config", async (req, res, next) => {
    const { stripeKey, stripePubKey, stripeMerchantKey, stripeWebhookSecret, customApiKey } = req.body;
    try {
      const envPath = path.join(process.cwd(), ".env");
      let content = "";
      try {
        content = await fs.readFile(envPath, "utf-8");
      } catch (e) {}

      let lines = content.split("\n");
      if (stripeKey !== undefined) {
        lines = lines.filter(line => !line.startsWith("STRIPE_SECRET_KEY="));
        lines.push(`STRIPE_SECRET_KEY="${stripeKey}"`);
      }
      if (stripePubKey !== undefined) {
        lines = lines.filter(line => !line.startsWith("STRIPE_PUBLISHABLE_KEY="));
        lines.push(`STRIPE_PUBLISHABLE_KEY="${stripePubKey}"`);
      }
      if (stripeMerchantKey !== undefined) {
        lines = lines.filter(line => !line.startsWith("STRIPE_MERCHANT_KEY="));
        lines.push(`STRIPE_MERCHANT_KEY="${stripeMerchantKey}"`);
      }
      if (stripeWebhookSecret !== undefined) {
        lines = lines.filter(line => !line.startsWith("STRIPE_WEBHOOK_SECRET="));
        lines.push(`STRIPE_WEBHOOK_SECRET="${stripeWebhookSecret}"`);
      }
      if (customApiKey !== undefined) {
        lines = lines.filter(line => !line.startsWith("CUSTOM_API_KEY="));
        lines.push(`CUSTOM_API_KEY="${customApiKey}"`);
      }
      await fs.writeFile(envPath, lines.join("\n").trim() + "\n", "utf-8");
      res.json({ success: true, message: "Configuration updated. Please restart the server to apply changes." });
    } catch (error: any) {
      next(error);
    }
  });

  apiRouter.post("/stripe/connect", async (req, res, next) => {
    if (!stripe) return res.status(500).json({ error: "Stripe not configured" });
    try {
      const account = await stripe.accounts.create({ type: 'express' });
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${APP_URL}/dashboard`,
        return_url: `${APP_URL}/dashboard`,
        type: 'account_onboarding',
      });
      res.json({ url: accountLink.url });
    } catch (error: any) {
      next(error);
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // 404 handler for API routes
  app.all("/api/*", (req, res) => {
    console.warn(`[404] API route not found: ${req.method} ${req.url}`);
    res.status(404).json({ error: "API route not found" });
  });

  // Vite middleware for development
  console.log(`[Startup] NODE_ENV: ${process.env.NODE_ENV}`);
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    try {
      await fs.access(distPath);
      console.log(`[Production] Serving static files from: ${distPath}`);
      const files = await fs.readdir(distPath);
      console.log(`[Production] Files in dist: ${files.join(", ")}`);
      const hasIndex = files.includes("index.html");
      if (!hasIndex) {
        console.error(`[Production] CRITICAL: index.html not found in ${distPath}`);
      }
    } catch (e) {
      console.error(`[Production] CRITICAL: dist directory not found at ${distPath}. Did you run 'npm run build'?`);
    }
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  // Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled Error:", err);
    // Ensure we always return JSON for API errors
    if (req.url.startsWith('/api')) {
      return res.status(err.status || 500).json({
        error: err.message || "An unexpected error occurred",
        status: err.status || 500
      });
    }
    next(err);
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
