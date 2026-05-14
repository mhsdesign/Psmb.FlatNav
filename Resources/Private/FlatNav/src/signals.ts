import {createChannel} from '@neos-project/framework-observable';

export class NodeWasCreated
{
    public constructor(
        public readonly nodeTypeName: string
    ) {
    }
}

export class DimensionSpacePointWasChanged
{
}

export const signals$ = createChannel<NodeWasCreated | DimensionSpacePointWasChanged>();

export const createNode = (nodeTypeName: string) => signals$.next(new NodeWasCreated(nodeTypeName));

export const changeDimensionSpacePoint = () => signals$.next(new DimensionSpacePointWasChanged());
