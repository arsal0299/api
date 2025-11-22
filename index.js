import express from "express";
import cors from "cors";
import { supabase } from "./supabase.js";
import { createOrder } from "./smm.js";

const app = express();
app.use(cors());
app.use(express.json());

// USER REGISTER
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  await supabase.from("users").insert({
    email,
    password,
    credits: 0
  });
  res.json({ message: "User registered" });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .eq("password", password);

  if (data.length === 0) return res.json({ error: "Invalid login" });

  res.json({ user: data[0] });
});

// Earn credits through Ad
app.post("/earn", async (req, res) => {
  const { userId } = req.body;

  await supabase
    .from("users")
    .update({ credits: supabase.rpc("increment", { x: 10 }) })
    .eq("id", userId);

  res.json({ message: "10 credits added" });
});

// Place Order
app.post("/order", async (req, res) => {
  const { userId, service, link, quantity, creditsUsed } = req.body;

  // Deduct credits
  await supabase
    .from("users")
    .update({ credits: supabase.rpc("decrement", { x: creditsUsed }) })
    .eq("id", userId);

  // Create SMM API order
  const response = await createOrder(service, link, quantity);

  // Save in database
  await supabase.from("orders").insert({
    user_id: userId,
    service_id: service,
    link,
    quantity,
    credits_used: creditsUsed,
    smm_order_id: response.order,
    status: "Pending"
  });

  res.json({ message: "Order placed", order_id: response.order });
});

app.listen(3000, () => console.log("Backend running on 3000"));
