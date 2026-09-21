import React from 'react';
import cx from 'classnames';
import style from './style.module.css';
import {useStore, useSelector} from 'react-redux';
import {actions, selectors} from '@neos-project/neos-ui-redux-store';
import {Icon} from '@neos-project/react-ui-components';
import {NodeAddress} from "./nodeAddress";

export const NavigationRootItem: React.FC<{
    nodeAddress: NodeAddress
}> = (props) => {
    const store = useStore();

    const node = useSelector(selectors.CR.Nodes.makeGetNodeByContextPathSelector(props.nodeAddress.toJson()))

    const focusedNodeAddress = useSelector(selectors.CR.Nodes.focusedNodePathSelector);
    const publishableNodes = useSelector(state => state?.cr?.workspaces?.personalWorkspace?.publishableNodes);

    const isFocused = focusedNodeAddress === node?.contextPath;
    const isDirty = React.useMemo(() => Boolean(publishableNodes.find(i => (
        i?.contextPath === node.contextPath ||
        i?.documentContextPath === node.contextPath
    ))), [node, publishableNodes]);

    const nodeItemClassNames = cx({
        [style.node]: true,
        [style.nodeFocused]: isFocused,
        [style.nodeDirty]: isDirty,
    })

    const onClick = React.useCallback(() => {
        if (!node) {
            return;
        }
        store.dispatch(actions.UI.ContentCanvas.setSrc(node.uri));
        store.dispatch(actions.UI.PageTree.focus(node.contextPath));
    }, [store, node]);

    if (!node) {
        return '';
    }

    return (
        <div
            className={nodeItemClassNames}
            key={node.contextPath}
            onClick={onClick}
            role="button"
        >
            {
                node.properties?._hidden ? (
                    <span className="fa-layers fa-fw">
                        <Icon icon="circle" color="error" transform="shrink-3"/>
                        <Icon icon="times" transform="shrink-7"/>
                        </span>
                ) : null
            }
            <span className={style.nodeLabel}>
                {node.label}
            </span>
        </div>
    );
}




