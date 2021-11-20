import { OrderStatus } from "@rsticket/common";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order } from "../../model/orders";
import { Payment } from "../../model/payment";
import { stripe } from "../../stripe";

// jest.mock("../../stripe");

it("returns a 404 when purchasing an order that doesn't exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "askdlf",
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it("returns 401 when purchasing an order that doesn't belong to the user", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    status: OrderStatus.Created,
    userId: "djfkdsf",
    version: 0,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "jdafsj",
      orderId: order.id,
    })
    .expect(401);
});

it("returns 400 when purchasing a cancelled order", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    status: OrderStatus.Cancelled,
    userId: userId,
    version: 0,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "djfksf",
      orderId: order.id,
    })
    .expect(400);
});

// it("returns a 201 with valid inputs", async () => {
//   const price = Math.floor(Math.random() * 100000);
//   const userId = new mongoose.Types.ObjectId().toHexString();
//   const order = Order.build({
//     id: new mongoose.Types.ObjectId().toHexString(),
//     price,
//     status: OrderStatus.Created,
//     userId,
//     version: 0,
//   });
//   await order.save();

//   await request(app)
//     .post("/api/payments")
//     .set("Cookie", global.signin(userId))
//     .send({
//       token: "tok_visa",
//       orderId: order.id,
//     })
//     .expect(201);

//   const stripeCharges = await stripe.charges.list({ limit: 50 });
//   const stripeCharge = stripeCharges.data.find(charge => {
//     return charge.amount === price;
//   });

//   expect(stripeCharge).toBeDefined();
//   expect(stripeCharge!.currency).toEqual("inr");

//   const payment = await Payment.findOne({
//     orderId: order.id,
//     stripeId: stripeCharge!.id,
//   });
//   expect(payment).not.toBeNull();
// });
