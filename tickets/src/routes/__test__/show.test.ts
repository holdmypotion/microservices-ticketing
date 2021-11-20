// test 1: returns 404 for a ticket that doesn't exists
// test 1: returns 200 for a ticket that does

import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";

it("returns 404 if the ticket is not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it("returns 200 if the ticket is found", async () => {
  const title = "concert";
  const price = 30;

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title,
      price,
    })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});
