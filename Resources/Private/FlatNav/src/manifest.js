import React from 'react';
import manifest from '@neos-project/neos-ui-extensibility';
import makeFlatNavContainer from './makeFlatNavContainer';
import style from './style.module.css';
import {createNodePeerVariationHandler, registerDialog, createNodeVariantCreationNeosUiAdapter} from './NodePeerVariation';
import {takeLatest} from 'redux-saga/effects';
import {actionTypes, selectors} from '@neos-project/neos-ui-redux-store';
import {changeDimensionSpacePoint, createNode} from './signals';

manifest('Psmb.FlatNav:FlatNav', {}, (globalRegistry, {store, frontendConfiguration}) => {
    const containerRegistry = globalRegistry.get('containers');
    const PageTreeToolbar = containerRegistry.get('LeftSideBar/Top/PageTreeToolbar');
    const PageTreeSearchbar = containerRegistry.get('LeftSideBar/Top/PageTreeSearchbar');
    const PageTree = containerRegistry.get('LeftSideBar/Top/PageTree');

    if (frontendConfiguration?.Psmb_FlatNav?.disableDimensionSwitcher ?? null) {
        containerRegistry.set('PrimaryToolbar/Right/DimensionSwitcher', () => null);
    }

    const nodePeerVariationHandler = createNodePeerVariationHandler({
        afterVariationWasConfirmedHook: createNodeVariantCreationNeosUiAdapter(store)
    });
    registerDialog(globalRegistry, nodePeerVariationHandler);

    const OriginalTree = () => (
        <div className={style.pageTreeContainerOriginal}>
            <div className={style.pageTreeToolbarOriginal}>
                <PageTreeToolbar/>
            </div>
            <PageTreeSearchbar/>
            <PageTree/>
        </div>
    );
    containerRegistry.set('LeftSideBar/Top/PageTreeToolbar', () => null);
    containerRegistry.set('LeftSideBar/Top/PageTreeSearchbar', () => null);

    containerRegistry.set('LeftSideBar/Top/PageTree', makeFlatNavContainer(OriginalTree, nodePeerVariationHandler));

    const sagasRegistry = globalRegistry.get('sagas');
    sagasRegistry.set('Psmb.FlatNav/convertSignals', {saga: convertSignals});

    const serverFeedbackHandlers = globalRegistry.get('serverFeedbackHandlers');

    serverFeedbackHandlers.set('Neos.Neos.Ui:NodeCreated/FlatNav', (feedbackPayload) => {
        const state = store.getState();

        const getNodeByContextPathSelector = selectors.CR.Nodes.makeGetNodeByContextPathSelector(feedbackPayload.contextPath);
        const newNode = getNodeByContextPathSelector(state);

        const {aggregateId: parentNodeAggregateId} = JSON.parse(newNode.parent);

        /**
         * only _after_ the node was created on the server we can reload the tree
         * watching actionTypes.CR.Nodes.MERGE, actionTypes.CR.Nodes.ADD, actionTypes.CR.Nodes.SET_STATE is not sufficient as these are optimistic updates.
         */
        createNode(
            newNode.nodeType,
            parentNodeAggregateId
        );
    }, 'after Neos.Neos.Ui:NodeCreated/Main');
});

function* convertSignals() {
    let lastSerializedDimensionSpacePoint = null;

    yield takeLatest([actionTypes.CR.ContentDimensions.SET_ACTIVE, actionTypes.Changes.PERSIST], function* (action) {
        if (action.type === actionTypes.CR.ContentDimensions.SET_ACTIVE) {
            const newSerializedDimensionSpacePoint = JSON.stringify(action.payload.dimensionValues);
            if (lastSerializedDimensionSpacePoint !== newSerializedDimensionSpacePoint) {
                changeDimensionSpacePoint();
                lastSerializedDimensionSpacePoint = newSerializedDimensionSpacePoint;
            }
        }
    });
}
