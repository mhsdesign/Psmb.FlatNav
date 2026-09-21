type NodeAddressData = {
    contentRepositoryId: string;
    workspaceName: string;
    dimensionSpacePoint: Record<string, string>;
    aggregateId: string;
};

const instances: Record<string, NodeAddress> = {};

export class NodeAddress
{
    private jsonSerialized?: string;

    private constructor(
        private readonly data: NodeAddressData,
    ) {
    }

    public static fromJsonString(jsonNodeAddress: string): NodeAddress
    {
        if (jsonNodeAddress in instances) {
            return instances[jsonNodeAddress];
        }

        const object = JSON.parse(jsonNodeAddress);

        if (object === null || typeof object !== "object") {
            throw new Error(`Expected Json NodeAddress got: ${jsonNodeAddress}. Not an object.`);
        }

        if ("contentRepositoryId" in object && "workspaceName" in object && "dimensionSpacePoint" in object && "aggregateId" in object) {
            return instances[jsonNodeAddress] = new NodeAddress(object);
        }

        throw new Error(`Expected Json NodeAddress got: ${jsonNodeAddress}. Missing object keys.`);
    }

    public withAggregateId(aggregateId: string): NodeAddress
    {
        return new NodeAddress({...this.data, aggregateId});
    }

    public toJson()
    {
        return this.jsonSerialized ??= JSON.stringify(this.data);
    }
}
