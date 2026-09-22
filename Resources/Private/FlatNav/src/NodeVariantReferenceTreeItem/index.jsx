import React from 'react';
import style from './style.module.css';
import {Icon} from '@neos-project/react-ui-components';
import cx from 'classnames';

export const NodeVariantReferenceTreeItem = (props) => {
    const nodeItemClassNames = cx({
        [style.node]: true,
        [style.nodeForeign]: true
    })

    return (
        <div
            className={nodeItemClassNames}
            onClick={props.onClick}
            role="button"
        >
            <Icon icon="copy" />
            <span className={style.nodeLabel}>
            {props.label}
        </span>
        </div>
    );
}
