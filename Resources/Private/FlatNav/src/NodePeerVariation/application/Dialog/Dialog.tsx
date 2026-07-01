import * as React from 'react';

import {Button, Dialog, Icon} from '@neos-project/react-ui-components';
import style from './style.module.css';
import {INodePeerVariationHandler, INodePeerVariationState} from '../../domain';
import {useLatestState} from '@neos-project/framework-observable-react';
import {useSelector} from '@neos-project/neos-ui-redux-store';
import {translate} from '@neos-project/neos-ui-i18n';

export const createDialog = (nodePeerVariationHandler: INodePeerVariationHandler) => () => {
    const nodePeerVariationHandlerState = useLatestState(nodePeerVariationHandler.state$);

    const isAuthenticated = useSelector(state => !state.system?.authenticationTimeout);

    if (!isAuthenticated) {
        return null;
    }

    if (nodePeerVariationHandlerState.isOpen) {
        return <NodePeerVariation nodePeerVariationHandler={nodePeerVariationHandler} state={nodePeerVariationHandlerState} />;
    }

    return null;
};

const NodePeerVariation: React.FC<{
    nodePeerVariationHandler: INodePeerVariationHandler
    state: INodePeerVariationState
}> = ({nodePeerVariationHandler, state}) => {
    const {dismiss, confirm, acknowledge} = nodePeerVariationHandler.transactions;

    if (!state.isOpen) {
        return null;
    }

    let description = null;
    if (state.isLoading) {
        description = <Icon className={style.spinner} icon="spinner" spin={true} size="2x" />
    } else if (state.isFinished) {
        description = <>Kopie "{state.nodePeerVariantReference.label}" wurde erstellt.</>
    } else {
        description = <>Möchten sie "{state.nodePeerVariantReference.label}" von "{state.nodePeerVariantReference.peerVariantOriginLabel}" kopieren?</>
    }

    return (
        <Dialog
            id="flatnav-NodePeerVariation"
            isOpen={true}
            preventClosing={state.isLoading}
            onRequestClose={dismiss}
            title={translate('Todo:todo:todo', 'Dokument "{label}" kopieren', {label: state.nodePeerVariantReference.label})}
            style="auto"
            autoFocus={true}
            actions={[
                <Button onClick={dismiss} disabled={state.isLoading || state.isFinished}>
                    {translate('Todo:todo:todo', 'Abbrechen')}
                </Button>,
                state.isFinished ? (
                    <Button
                        id="flatnav-NodePeerVariation-acknowledge"
                        style="success"
                        type="submit"
                        onClick={acknowledge}
                    >
                        {translate('Todo:todo:todo', 'Schließen')}
                    </Button>
                ) : (
                    <Button
                        id="flatnav-NodePeerVariation-confirm"
                        style="success"
                        type="submit"
                        disabled={state.isLoading}
                        onClick={confirm}
                    >
                        {translate('Todo:todo:todo', 'Kopieren')}
                    </Button>
                )
            ]}
        >
            <div className={style.modalContents}>
                {state.isLoading ? (
                    <Icon className={style.spinner} icon="spinner" spin={true} size="2x" />
                ) : state.isFinished ? (
                    <div>Kopie "{state.nodePeerVariantReference.label}" wurde erstellt.</div>
                ) : (
                    <iframe className={style.modalIframe} src={state.nodePeerVariantReference.peerVariantOriginPreviewUri}></iframe>
                )}
            </div>


            {!state.isLoading && !state.isFinished ? (
                <div className={style.copyDescriptionCorner}>Möchten sie "{state.nodePeerVariantReference.label}" von "{state.nodePeerVariantReference.peerVariantOriginLabel}" kopieren?</div>
            ) : ''}

        </Dialog>
    )
}
