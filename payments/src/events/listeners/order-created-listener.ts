import { Listener, OrderCreatedEvent, Subjects } from "@rsticket/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../model/orders";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: OrderCreatedEvent["subject"] = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      version: data.version,
      userId: data.userId,
    });
    await order.save();

    msg.ack();
  }
}
