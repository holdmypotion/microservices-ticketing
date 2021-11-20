import { ExpirationCompleteEvent, Publisher, Subjects } from "@rsticket/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: ExpirationCompleteEvent["subject"] = Subjects.ExpirationComplete;
}
