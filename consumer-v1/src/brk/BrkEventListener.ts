import { JsonLD } from "../types";

export class BrkEventListener {
  private state = new Map();

  public async process(event: any): Promise<void> {
    try {
      //   console.log(JSON.stringify(event));

      let aggregateId: string =
        event["https://kadaster.nl/def/aggregateIdentifier"]["@id"];

      if (aggregateId.includes("NL.IMKAD.KadastraalObject")) {
        console.info("working on aggregate [%s]", aggregateId);
        let curAggregate = this.state.get(aggregateId);
        if (curAggregate === undefined) {
          curAggregate = {
            aggregateId: aggregateId,
            eventTypes: [],
          };
          this.state.set(aggregateId, curAggregate);
        }

        let eventType = event["https://kadaster.nl/def/payloadType"];
        curAggregate["eventTypes"].push(eventType);

        console.info("current aggregate: [%s]", JSON.stringify(curAggregate));
      } else {
        console.debug("skipping aggregate [%s]", aggregateId);
      }
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
    return new Promise<JsonLD>((resove) => {
      // TODO transform this.state into jsonLD
    });
  }
}
