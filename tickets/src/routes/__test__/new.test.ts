// test 1: to check if the route /api/tickets exists
// test 2: returns 401 for unauthorized users
// test 3: only allow signed in user to pass -> returns a status other than 401
// test 4: returns 400 if the request fails validation
// test 5: returns 201 for a valid ticket creation

import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("returns anything but 404 at /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404);
});

it("returns 401 for unauthorized users", async () => {
  await request(app).post("/api/tickets").send({}).expect(401);
});

it("returns anything but 401 at /api/tickets for signed in users", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({});

  console.log(response.status);
  expect(response.status).not.toEqual(401);
});

it("returns a 404 if request {title, price} is invalid", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "",
      price: 10,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      price: 10,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "back1",
      price: -10,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "back1",
    })
    .expect(400);
});

it("returns 201 for a valid request", async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const title = "front5";
  const price = 20;

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title,
      price,
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].title).toEqual(title);
  expect(tickets[0].price).toEqual(price);
});

it("should pass if the event gets published", async () => {
  const title = "front5";
  const price = 20;

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title,
      price,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
