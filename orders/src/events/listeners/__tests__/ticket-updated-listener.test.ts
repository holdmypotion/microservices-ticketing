import mongoose from "mongoose";
import { TicketCreatedEvent } from "@rsticket/common";
import { natsWrapper } from "../../../nats-wrapper";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { TicketUpdatedListener } from "../ticket-updated-listener";

const setup = async () => {
  // create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "live show",
    price: 20,
  });
  await ticket.save();

  // create a fake data obj
  const data: TicketCreatedEvent["data"] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: "Concert",
    price: 10,
    userId: "saflasjflkda",
  };

  // create a fake msg obj
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
};

it("finds, updates, and saves a ticket", async () => {
  const { listener, ticket, data, msg } = await setup();

  // call the onMessage fn
  await listener.onMessage(data, msg);

  // write assertion to make sure that the ticket was updated
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it("acks the message", async () => {
  const { msg, listener, data } = await setup();

  // call the onMessage fn
  await listener.onMessage(data, msg);

  // write assertion to make sure the ack fn was called
  expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if the event has a skipped version number", async () => {
  const { msg, data, listener } = await setup();

  data.version = 10;

  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
