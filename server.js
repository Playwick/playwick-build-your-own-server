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

    const response = await client.checkoutApi.createPaymentLink({
      idempotencyKey: crypto.randomUUID(),
      quickPay: {
        name: `Playwick - ${name}`,
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
        buyerNote: `Scent: ${scent}\nPlaylist: ${playlist}\nName: ${name}`,
      },
    });

    res.json({ url: response.result.paymentLink.url });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating checkout");
  }
});

app.get("/", (req, res) => {
  res.send("Playwick checkout server is running");
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
