export interface KoersEventMessage {
    aggregateIdentifier: string,
    sequenceNumber: string,
    type: string,
    identifier: string,
    metaData: string,
    payload: string,
    payloadType: string,
    payloadRevision: string,
    timestamp: string
}
