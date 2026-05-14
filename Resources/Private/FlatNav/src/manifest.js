import React from 'react';
import manifest from '@neos-project/neos-ui-extensibility';
import makeFlatNavContainer from './makeFlatNavContainer';
import style from './style.module.css';
import {createNodePeerVariationHandler, registerDialog, createNodeVariantCreationNeosUiAdapter} from './NodePeerVariation';
import {takeLatest} from 'redux-saga/effects';
import {actionTypes} from '@neos-project/neos-ui-redux-store';
import {changeDimensionSpacePoint, createNode} from './signals';

manifest('Psmb.FlatNav:FlatNav', {}, (globalRegistry, {store}) => {
    const containerRegistry = globalRegistry.get('containers');
    const PageTreeToolbar = containerRegistry.get('LeftSideBar/Top/PageTreeToolbar');
    const PageTreeSearchbar = containerRegistry.get('LeftSideBar/Top/PageTreeSearchbar');
    const PageTree = containerRegistry.get('LeftSideBar/Top/PageTree');

    const nodePeerVariationHandler = createNodePeerVariationHandler({
        afterVariationWasConfirmedHook: createNodeVariantCreationNeosUiAdapter(store)
    });
    registerDialog(globalRegistry, nodePeerVariationHandler);

    const OriginalTree = () => (
        <div>
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
});

function* convertSignals() {
    let lastSerializedDimensionSpacePoint = null;

    yield takeLatest([actionTypes.CR.ContentDimensions.SET_ACTIVE, actionTypes.Changes.PERSIST], function* (action) {
        if (action.type === actionTypes.Changes.PERSIST) {
            const newNodesOfNodeTypes = new Set(Object.values(action.payload.changes).filter(change => change.type.startsWith("Neos.Neos.Ui:Create")).map(change => change.payload.nodeType));
            for (const newNodesOfNodeType of newNodesOfNodeTypes) {
                createNode(newNodesOfNodeType);
            }
        }

        if (action.type === actionTypes.CR.ContentDimensions.SET_ACTIVE) {
            const newSerializedDimensionSpacePoint = JSON.stringify(action.payload.dimensionValues);
            if (lastSerializedDimensionSpacePoint !== newSerializedDimensionSpacePoint) {
                changeDimensionSpacePoint();
                lastSerializedDimensionSpacePoint = newSerializedDimensionSpacePoint;
            }
        }
    });
}
