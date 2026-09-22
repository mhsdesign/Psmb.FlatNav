import React from 'react';
import cx from 'classnames';
import style from './style.module.css';
import {useStore, useSelector} from 'react-redux';
import {actions, selectors} from '@neos-project/neos-ui-redux-store';
import {Icon} from '@neos-project/react-ui-components';

export const NodeTreeItem = (props) => {
    const store = useStore();

    const focusedNodeAddress = useSelector(selectors.CR.Nodes.focusedNodePathSelector);
    const publishableNodes = useSelector(state => state?.cr?.workspaces?.personalWorkspace?.publishableNodes);

    const isFocused = focusedNodeAddress === props.nodeData.contextPath;
    const isDirty = React.useMemo(() => Boolean(publishableNodes.find(i => (
        i?.contextPath === props.nodeData.contextPath ||
        i?.documentContextPath === props.nodeData.contextPath
    ))), [props.nodeData, publishableNodes]);

    const nodeItemClassNames = cx({
        [style.node]: true,
        [style.nodeFocused]: isFocused,
        [style.nodeDirty]: isDirty,
    })

    const onClick = React.useCallback(() => {
        store.dispatch(actions.UI.ContentCanvas.setSrc(props.nodeData?.uri));
        store.dispatch(actions.UI.PageTree.focus(props.nodeData.contextPath));
    }, [store, props.nodeData]);

    return (
        <div
            className={nodeItemClassNames}
            key={props.nodeData.contextPath}
            onClick={onClick}
            role="button"
        >
            {
                props.nodeData?.properties?._hidden ? (
                    <span className="fa-layers fa-fw">
                        <Icon icon="circle" color="error" transform="shrink-3"/>
                        <Icon icon="times" transform="shrink-7"/>
                    </span>
                ) : null
            }
            <span className={style.nodeLabel}>
                {props.nodeData?.label}
            </span>
        </div>
    );
}
