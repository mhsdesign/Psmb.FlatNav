import {createAction} from 'typesafe-actions';

export const VariationWasStarted = createAction(
    'VariationWasStarted',
    (
        nodeAggregateId: string,
        peerVariantOriginDimension: any,
        label: string,
        peerVariantOriginLabel: string,
        peerVariantOriginPreviewUri: string,
    ) => ({nodeAggregateId, label, peerVariantOriginLabel, peerVariantOriginDimension, peerVariantOriginPreviewUri})
)();

export const VariationWasConfirmed = createAction(
    'VariationWasConfirmed'
)();

export const VariationWasDismissed = createAction(
    'VariationWasDismissed'
)();

export const VariationWasFinished = createAction(
    'VariationWasFinished',
    (
        nodeAggregateId: string,
    ) => ({nodeAggregateId})
)();

export const VariationWasAcknowledged = createAction(
    'VariationWasAcknowledged',
    (
        nodeAggregateId: string,
    ) => ({nodeAggregateId})
)();
