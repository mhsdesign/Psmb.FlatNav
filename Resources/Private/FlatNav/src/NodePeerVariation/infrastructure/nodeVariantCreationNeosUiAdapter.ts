
import {actions, selectors} from '@neos-project/neos-ui-redux-store';
import backend from '@neos-project/neos-ui-backend-connector';

export const createNodeVariantCreationNeosUiAdapter = (store) => async ({nodeAggregateId, peerVariantOriginDimension}) => {
    const {adoptNodeToOtherDimension, getWorkspaceInfo} = backend.get().endpoints;

    const currentWorkspaceName = selectors.CR.Workspaces.personalWorkspaceNameSelector(store.getState());
    const targetDimensions = selectors.CR.ContentDimensions.active(store.getState());

    const {nodeFrontendUri, nodeContextPath} = await adoptNodeToOtherDimension({
        identifier: nodeAggregateId,
        workspaceName: currentWorkspaceName,
        targetDimensions,
        sourceDimensions: peerVariantOriginDimension,
        copyContent: true
    });

    const {q} = backend.get();
    const [fullyLoadedNode] = await q(nodeContextPath).get();

    if (fullyLoadedNode) {
        store.dispatch(actions.CR.Nodes.merge({
            [fullyLoadedNode.contextPath]: fullyLoadedNode
        }));
    }

    const workspaceInfo = await getWorkspaceInfo();
    store.dispatch(actions.CR.Workspaces.update(workspaceInfo));

    store.dispatch(actions.UI.PageTree.focus(nodeContextPath))
    store.dispatch(actions.UI.ContentCanvas.setSrc(nodeFrontendUri))
}
