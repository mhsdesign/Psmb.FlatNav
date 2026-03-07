import {ActionType, getType} from 'typesafe-actions';

import * as actions from './NodePeerVariationAction';
import {createChannel, createState, ReadonlyState} from '@neos-project/framework-observable';

export type INodePeerVariationState =
    | {
        isOpen: false
        isLoading: false;
        isFinished: false;
        nodePeerVariantReference: null
    } | {
        isOpen: true;
        isLoading: boolean;
        isFinished: boolean;
        nodePeerVariantReference: {
            nodeAggregateId: string,
            peerVariantOriginDimension: any,
            label: string,
            peerVariantOriginLabel: string,
        }
    }
;

type INodePeerVariationResult =
    | {variantWasCreated: true}
    | {variantWasCreated: false}
;

const initialState: INodePeerVariationState = {
    isOpen: false,
    isLoading: false,
    isFinished: false,
    nodePeerVariantReference: null
};

function reducer(
    state: INodePeerVariationState = initialState,
    action: ActionType<typeof actions>
): INodePeerVariationState {
    switch (action.type) {
        case getType(actions.VariationWasStarted):
            return {
                nodePeerVariantReference: action.payload,
                isLoading: false,
                isFinished: false,
                isOpen: true
            };
        case getType(actions.VariationWasConfirmed):
            return {
                ...state,
                isLoading: true,
                isOpen: true
            };
        case getType(actions.VariationWasFinished):
            return {
                ...state,
                isFinished: true,
                isLoading: false,
                isOpen: true
            };
        case getType(actions.VariationWasDismissed):
        case getType(actions.VariationWasAcknowledged):
            return initialState;
        default:
            return state;
    }
}

export function createNodePeerVariationHandler(hooks: {afterVariationWasConfirmedHook: (nodePeerVariantReference: {nodeAggregateId: string, peerVariantOriginDimension: any}) => Promise<void>}) {
    const actions$ = createChannel<ActionType<typeof actions>>();

    const dispatch = actions$.next;

    const state$ = createState(initialState);

    actions$.subscribe({
        next: (action) => state$.update(
            (current) => reducer(
                current,
                action
            )
        )
    })

    const dismiss = () => dispatch(actions.VariationWasDismissed());
    const confirm = () => dispatch(actions.VariationWasConfirmed());
    const acknowledge = () => dispatch(actions.VariationWasAcknowledged());
    const start = (
        nodeAggregateId: string,
        peerVariantOriginDimension: any,
        label: string,
        peerVariantOriginLabel: string,
    ) => new Promise<INodePeerVariationResult>(
        resolve => {
            dispatch(
                actions.VariationWasStarted(
                    nodeAggregateId,
                    peerVariantOriginDimension,
                    label,
                    peerVariantOriginLabel,
                )
            );

            const subscription = actions$.subscribe({
                next: async action => {
                    switch (action.type) {
                        case getType(actions.VariationWasDismissed):
                            subscription.unsubscribe();
                            return resolve({variantWasCreated: false});
                        case getType(actions.VariationWasConfirmed):
                            // TODO error handling
                            await hooks.afterVariationWasConfirmedHook({
                                nodeAggregateId,
                                peerVariantOriginDimension,
                            });
                            dispatch(actions.VariationWasFinished());
                            return;
                        case getType(actions.VariationWasAcknowledged):
                            subscription.unsubscribe();
                            return resolve({variantWasCreated: true});
                        default:
                    }
                }
            });
        }
    );

    return Object.freeze({
        state$: state$ as ReadonlyState<INodePeerVariationState>,
        transactions: {dismiss, acknowledge, confirm, start}
    });
}

export type INodePeerVariationHandler = ReturnType<typeof createNodePeerVariationHandler>;
