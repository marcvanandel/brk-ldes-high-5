import { Quad, DataFactory } from "n3";

const { namedNode, quad, literal } = DataFactory;

interface PerceelAggregate {
  aggregateId: string;
  kadastraleAanduiding: string;
  logischTijdstip: string;
  zakelijkeRechten: ZakelijkRecht[];
}

interface ZakelijkRecht {
  id: string;
  type: string;
  aandelen?: Aandeel[];
}

interface Aandeel {
  teller: number;
  noemer: number;
  personId: string;
}

export class BrkEventListener {
  private state = new Map();

  public async process(event: any): Promise<void> {
    try {
      //   console.log(JSON.stringify(event));

      let aggregateId: string =
        event["https://kadaster.nl/def/aggregateIdentifier"]["@id"];

      if (aggregateId.includes("NL.IMKAD.KadastraalObject")) {
        console.info("working on aggregate [%s]", aggregateId);

        let perceel: PerceelAggregate = this.state.get(aggregateId);
        let eventType: string = event["https://kadaster.nl/def/payloadType"];

        if (perceel === undefined && !eventType.endsWith("PerceelOntstaan")) {
          return;
        }

        console.log(
          `eventType [${eventType}] on aggregate: \n${JSON.stringify(
            perceel,
            null,
            2
          )}`
        );

        if (perceel === undefined && eventType.endsWith("PerceelOntstaan")) {
          let eigendom: ZakelijkRecht = {
            id: this.getEigendomId(event),
            type: "Eigendom",
          };
          perceel = {
            aggregateId: aggregateId,
            kadastraleAanduiding: this.getKadastraleAanduiding(event),
            logischTijdstip: this.getLogischTijdstip(event),
            zakelijkeRechten: [eigendom],
          };
          this.state.set(aggregateId, perceel);
          console.info("created aggregate: [%s]", JSON.stringify(perceel));
        }

        if (
          perceel != undefined &&
          // perceel.zakelijkeRechten[0].aandelen === undefined &&
          eventType.endsWith("ZakelijkRechtTenaamgesteld")
        ) {
          let van = this.getVan(event);
          let zakelijkRecht = perceel.zakelijkeRechten.find(
            (r) => r.id === van
          )!;
          if (zakelijkRecht != undefined) {
            let aandelen = this.getAandelenList(event).map((aandeelPart) => {
              let aandeel: Aandeel = {
                teller: this.getTeller(aandeelPart),
                noemer: this.getNoemer(aandeelPart),
                personId: this.getPersonId(aandeelPart),
              };
              return aandeel;
            });
            zakelijkRecht.aandelen = aandelen;
            console.info("updated aggregate: [%s]", JSON.stringify(perceel));
          }
        }

        console.info("current aggregate: [%s]", JSON.stringify(perceel));
      }
    } catch (error) {
      console.warn(error);
      console.log(JSON.stringify(event, null, 2));
      process.exit(1);
    }
  }

  public logState() {
    console.log(
      "processed event to this state:\n%s",
      JSON.stringify(this.state)
    );
  }

  public writeState(): Quad[] {
    const result: Quad[] = [];
    result.push(
      quad(
        namedNode("https://example.com/subject"),
        namedNode("https://example.com/pred"),
        namedNode("https://example.com/object")
      )
    );
    result.push(
      quad(
        namedNode("https://example.com/subject"),
        namedNode("https://example.com/pred"),
        literal(2)
      )
    );
    return [];
  }

  private getKadastraleAanduiding(event: any): string {
    let gem =
      event["https://kadaster.nl/def/payload"]["ns2:perceelOntstaan"][
        "https://kadaster.nl/def/kadastraleAanduiding"
      ]["https://kadaster.nl/def/kadastraleGemeente"][
        "https://kadaster.nl/def/waarde"
      ];
    let s =
      event["https://kadaster.nl/def/payload"]["ns2:perceelOntstaan"][
        "https://kadaster.nl/def/kadastraleAanduiding"
      ]["https://kadaster.nl/def/sectie"];
    let no =
      event["https://kadaster.nl/def/payload"]["ns2:perceelOntstaan"][
        "https://kadaster.nl/def/kadastraleAanduiding"
      ]["https://kadaster.nl/def/perceelNummer"];
    return `${gem} ${s} ${no}`;
  }

  private getLogischTijdstip(event: any) {
    return event["https://kadaster.nl/def/payload"]["ns2:perceelOntstaan"][
      "https://kadaster.nl/def/eventIdentificatie"
    ]["https://kadaster.nl/def/logischTijdstip"];
  }
  private getEigendomId(event: any) {
    return event["https://kadaster.nl/def/payload"]["ns2:perceelOntstaan"][
      "https://kadaster.nl/def/eigendomId"
    ];
  }
  private getVan(event: any) {
    return event["https://kadaster.nl/def/payload"][
      "ns2:zakelijkRechtTenaamgesteld"
    ]["https://kadaster.nl/def/van"];
  }
  private getAandelenList(event: any): any[] {
    return event["https://kadaster.nl/def/payload"][
      "ns2:zakelijkRechtTenaamgesteld"
    ]["https://kadaster.nl/def/verkregenAandelen"][
      "https://kadaster.nl/def/aandeel"
    ];
  }
  private getTeller(event: any) {
    let teller =
      event["https://kadaster.nl/def/aandeel"][
        "https://kadaster.nl/def/teller"
      ];
    console.log("found teller [%s]");
    return teller;
  }
  private getNoemer(event: any) {
    let noemer =
      event["https://kadaster.nl/def/aandeel"][
        "https://kadaster.nl/def/noemer"
      ];
    console.log("found noemer [%s]", noemer);
    return noemer;
  }
  private getPersonId(event: any) {
    return event["https://kadaster.nl/def/aandeel"][
      "https://kadaster.nl/def/geldtVoor"
    ]["https://kadaster.nl/def/tenaamstelling"][
      "https://kadaster.nl/def/tenNameVan"
    ];
  }
}
