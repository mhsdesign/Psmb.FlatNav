
import {createDialog} from './Dialog';
import {GlobalRegistry} from '@neos-project/neos-ui-registry';
import {INodePeerVariation} from "../../domain";

export function registerDialog(
    globalRegistry: GlobalRegistry,
    editor: INodePeerVariation
): void {
    const containersRegistry = globalRegistry.get('containers')!;

    containersRegistry.set(
        'Modals/FlatNav-NodePeerVariation',
        createDialog(editor)
    );
}
