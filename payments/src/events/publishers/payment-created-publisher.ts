import { PaymentCreatedEvent, Publisher, Subjects } from "@rsticket/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: PaymentCreatedEvent["subject"] = Subjects.PaymentCreated;
}
