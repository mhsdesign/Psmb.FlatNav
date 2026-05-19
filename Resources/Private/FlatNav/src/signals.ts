import {createChannel} from '@neos-project/framework-observable';

export class NodeWasCreated
{
    public constructor(
        public readonly nodeTypeName: string,
        public readonly parentNodeAggregateId: string
    ) {
    }
}

export class DimensionSpacePointWasChanged
{
}

export const signals$ = createChannel<NodeWasCreated | DimensionSpacePointWasChanged>();

export const createNode = (nodeTypeName: string, parentNodeAggregateId: string) => signals$.next(new NodeWasCreated(nodeTypeName, parentNodeAggregateId));

export const changeDimensionSpacePoint = () => signals$.next(new DimensionSpacePointWasChanged());
