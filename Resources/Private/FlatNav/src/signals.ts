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

export class BaseWorkspaceWasChanged
{
}

export class WorkspaceWasPublishedOrDiscarded
{
}

export class WorkspaceWasRebased
{
}

export const signals$ = createChannel<
    NodeWasCreated
    | DimensionSpacePointWasChanged
    | BaseWorkspaceWasChanged
    | WorkspaceWasPublishedOrDiscarded
    | WorkspaceWasRebased
>();

export const createNode = (nodeTypeName: string, parentNodeAggregateId: string) => signals$.next(new NodeWasCreated(nodeTypeName, parentNodeAggregateId));

export const changeDimensionSpacePoint = () => signals$.next(new DimensionSpacePointWasChanged());

export const changeBaseWorkspace = () => signals$.next(new BaseWorkspaceWasChanged());

export const publishOrDiscardWorkspace = () => signals$.next(new WorkspaceWasPublishedOrDiscarded());

export const rebaseWorkspace = () => signals$.next(new WorkspaceWasRebased());
