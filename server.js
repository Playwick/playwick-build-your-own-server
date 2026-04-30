import crypto from "crypto";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Client, Environment } from "square";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Production,
});

app.post("/create-checkout", async (req, res) => {
  try {
    const { scent, playlist, name } = req.body;

    if (!scent || !playlist || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const orderNote = `PLAYWICK CUSTOM ORDER

Candle Name: ${name}
Scent: ${scent}
Playlist URL: ${playlist}

Fulfillment Note:
Please use the scent, candle name, and playlist URL exactly as entered above.`;

    const response = await client.checkoutApi.createPaymentLink({
      idempotencyKey: crypto.randomUUID(),
      quickPay: {
        name: `Custom Playwick: ${name}`,
        priceMoney: {
          amount: 3800,
          currency: "CAD",
        },
        locationId: process.env.SQUARE_LOCATION_ID,
      },
      checkoutOptions: {
        redirectUrl: "https://www.playwickcandles.com",
      },
      prePopulatedData: {
        buyerNote: orderNote,
      },
    });

    res.json({ url: response.result.paymentLink.url });

  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ error: "Error creating checkout" });
  }
});

app.get("/", (req, res) => {
  res.send("Playwick checkout server is running");
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
