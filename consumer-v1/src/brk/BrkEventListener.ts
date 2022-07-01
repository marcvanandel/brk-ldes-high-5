import { JsonLD } from "../types";

export class BrkEventListener {
  private state = new Map();

  public async process(event: any): Promise<void> {
    try {
      //   console.log(JSON.stringify(event));

      let aggregateId =
        event["https://kadaster.nl/def/aggregateIdentifier"]["@id"];

      console.info("working on aggregate [%s]", aggregateId);
      let curAggregate = this.state.get(aggregateId);
      if (curAggregate === undefined) {
        curAggregate = {
          aggregateId: aggregateId,
          eventTypes: [],
        };
        this.state.set(aggregateId, curAggregate);
      }
      console.info("current aggregate: [%s]", JSON.stringify(curAggregate));

      let eventType = event["https://kadaster.nl/def/payloadType"];
      curAggregate["eventTypes"].push(eventType);
    } catch (error) {
      console.warn(error);
    }
  }

  public logState() {
    console.log(
      "processed event to this state:\n%s",
      JSON.stringify(this.state)
    );
  }

  public async getStateAsJsonLD(): Promise<JsonLD> {
    return new Promise<JsonLD>((resove) => {});
  }
}
