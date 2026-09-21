import React from "react";
import {useSelector} from "react-redux";
import {selectors} from '@neos-project/neos-ui-redux-store';
import {NodeAddress} from "./nodeAddress";
import {NodeTreeItem} from './NodeTreeItem';

export const NavigationRootItem: React.FC<{
    nodeAddress: NodeAddress
}> = (props) => {
    const node = useSelector(selectors.CR.Nodes.makeGetNodeByContextPathSelector(props.nodeAddress.toJson()))

    if (!node) {
        return '';
    }

    return <NodeTreeItem nodeData={node} />;
};
