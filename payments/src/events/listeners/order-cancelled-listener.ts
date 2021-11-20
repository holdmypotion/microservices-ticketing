import {
  Listener,
  OrderCancelledEvent,
  OrderStatus,
  Subjects,
} from "@rsticket/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../model/orders";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: OrderCancelledEvent["subject"] = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    // fetch the order
    const order = await Order.findByEvent(data);

    if (!order) throw new Error("Order not found");

    // mark the status as OrderStatus.Cancelled
    order.set({ status: OrderStatus.Cancelled });

    await order.save();
    // increments the version and now the orders in the
    // orders DB matches with the orders in the payments DB
    msg.ack();
  }
}
