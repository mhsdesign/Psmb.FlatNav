import React from "react";
import {useSelector, useStore} from "react-redux";
import {actions, selectors} from '@neos-project/neos-ui-redux-store';
import backend from '@neos-project/neos-ui-backend-connector';
import {NodeAddress} from "./nodeAddress";
import {NodeTreeItem} from './NodeTreeItem';

export const ParentNodeLoader: React.FC<{
    nodeAddress: NodeAddress
}> = (props) => {

    const store = useStore();

    const node = useSelector(selectors.CR.Nodes.makeGetNodeByContextPathSelector(props.nodeAddress.toJson()))

    React.useEffect(() => {
        (async () => {
            const {q} = backend.get();
            const [fullyLoadedNode] = await q(props.nodeAddress.toJson()).getForTree('PAGE_TREE');

            if (fullyLoadedNode) {
                store.dispatch(actions.CR.Nodes.merge({
                    [fullyLoadedNode.contextPath]: fullyLoadedNode
                }));
            }
        })()
    }, [store, props.nodeAddress]);


    if (!node) {
        return '';
    }

    console.log(node)

    return <NodeTreeItem nodeData={node} />;
};
