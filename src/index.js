// const express = require("express");
// const {
//   trackRequest,
//   trackAuth,
//   trackUser,
//   trackPurchase,
// } = require("./metrics");
// const { authRouter, setAuthUser } = require("../routes/authRouter.js");
// const orderRouter = require("./orderRouter.js");

// const app = express();

// app.use(express.json());
// app.use(trackRequest); // Track all HTTP requests
// app.use(setAuthUser); // Parse JWT for all routes

// // Mount routers with auth middleware
// app.use("/api/auth", authRouter);
// app.use("/api/order", authRouter.authenticateToken, orderRouter);

// // Simple endpoints (optional, for testing)
// app.get("/pizza", authRouter.authenticateToken, (req, res) =>
//   res.send("Pizza list")
// );
// app.post("/pizza/order", authRouter.authenticateToken, async (req, res) => {
//   const { quantity } = req.body;
//   const startTime = Date.now();
//   try {
//     const cost = quantity * 5;
//     if (quantity > 20) throw new Error("Too many pizzas");
//     const latency = Date.now() - startTime;
//     trackPurchase({ quantity, cost, latency, success: true });
//     res.send(`Ordered ${quantity} pizzas`);
//   } catch (error) {
//     const latency = Date.now() - startTime;
//     trackPurchase({ quantity, cost: 0, latency, success: false });
//     res.status(500).send("Order failed");
//   }
// });

// const port = 3000;
// app.listen(port, () => {
//   console.log(`Server started on port ${port}`);
// });

const app = require("./service.js");

const port = process.argv[2] || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
