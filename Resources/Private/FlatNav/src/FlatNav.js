import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button, Icon, IconButton} from '@neos-project/react-ui-components';
import {connect} from 'react-redux';
import {actions, selectors} from '@neos-project/neos-ui-redux-store';
import {neos} from '@neos-project/neos-ui-decorators';
import HideSelectedNode from './HideSelectedNode';
import DeleteSelectedNode from './DeleteSelectedNode';
import mergeClassNames from 'classnames';
import style from './style.module.css';
import RefreshNodes from "./RefreshNodes";
import SearchInput from "./SearchInput";
import {DimensionSpacePointWasChanged, NodeWasCreated, signals$} from './signals';

@neos(globalRegistry => ({
    nodeTypesRegistry: globalRegistry.get('@neos-project/neos-ui-contentrepository'),
    i18nRegistry: globalRegistry.get('i18n')
}))
@connect(
    () => {
        return (state) => {
            const focusedNodeContextPath = selectors.UI.PageTree.getFocused(state);
            const getNodeByContextPathSelector = selectors.CR.Nodes.makeGetNodeByContextPathSelector(focusedNodeContextPath);
            const focusedNode = getNodeByContextPathSelector(state);
            const canBeDeleted = focusedNode?.policy?.canRemove || false;
            const canBeEdited = focusedNode?.policy?.canEdit || false;
            // TODO re-enable node creation constraint checks?
            // const isAllowedToAddChildOrSiblingNodesSelector = selectors.CR.Nodes.makeIsAllowedToAddChildOrSiblingNodes(nodeTypesRegistry);
            // const context = focusedNodeContextPath.split('@')[1];
            // const isAllowedToAddChildOrSiblingNodes = isAllowedToAddChildOrSiblingNodesSelector(state, {
            //     reference: newReferenceNodePath + '@' + context
            // });
            return {
                nodeData: state?.cr?.nodes?.byContextPath,
                focused: selectors.CR.Nodes.focusedNodePathSelector(state),
                siteNodeContextPath: selectors.CR.Nodes.siteNodeContextPathSelector(state),
                baseWorkspaceName: state?.cr?.workspaces?.personalWorkspace?.baseWorkspace,
                publishableNodes: state?.cr?.workspaces?.personalWorkspace?.publishableNodes,
                isAllowedToAddChildOrSiblingNodes: true,
                canBeDeleted,
                canBeEdited
            }
        }
    },
{
    setSrc: actions.UI.ContentCanvas.setSrc,
    focus: actions.UI.PageTree.focus,
    openNodeCreationDialog: actions.UI.NodeCreationDialog.open,
    commenceNodeCreation: actions.CR.Nodes.commenceCreation,
    selectNodeType: actions.UI.SelectNodeTypeModal.apply,
    merge: actions.CR.Nodes.merge
})
export default class FlatNav extends Component {
    static propTypes = {
        treeItems: PropTypes.array.isRequired,
        preset: PropTypes.object.isRequired,
        isLoading: PropTypes.bool.isRequired,
        page: PropTypes.number.isRequired,
        moreNodesAvailable: PropTypes.bool.isRequired,
        nodePeerVariationHandler: PropTypes.object.isRequired
    };

    subscription

    componentDidMount() {
        if (
            // No node paths in state on initial load
            this.props.treeItems.length === 0
        ) {
            this.props.fetchNodes();
        }

        this.subscription = signals$.subscribe({
            next: (action) => {
                if (action instanceof NodeWasCreated) {
                    if (action.nodeTypeName === this.props.preset.newNodeType) {
                        this.refreshFlatNav();
                    } else if (action.parentNodeAggregateId === this.props.preset.parentNodeAggregateId) {
                        this.refreshFlatNav();
                    }
                }
                if (action instanceof DimensionSpacePointWasChanged) {
                    this.refreshFlatNav();
                }
            }
        })
    }

    componentWillUnmount() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    componentDidUpdate() {
        if (
            // Node data not available for some nodes (e.g. after tree reload)
            !this.props.treeItems.filter(treeItem => treeItem.occupiedNode).every(treeItem => this.props.nodeData?.[treeItem.occupiedNode.contextPath])
        ) {
            this.props.fetchNodes();
        }
    }

    createNode = () => {
        const siteNodeAddressObject = JSON.parse(this.props.siteNodeContextPath);
        const parentNodeAddressObject = {
            contentRepositoryId: siteNodeAddressObject.contentRepositoryId,
            workspaceName: siteNodeAddressObject.workspaceName,
            dimensionSpacePoint: siteNodeAddressObject.dimensionSpacePoint,
            aggregateId: this.props.preset.parentNodeAggregateId || siteNodeAddressObject.aggregateId,
        };
        const parentNodeAddressString = JSON.stringify(parentNodeAddressObject);
        this.props.commenceNodeCreation(parentNodeAddressString, undefined, 'into', this.props.preset.newNodeType || undefined);
    }

    refreshFlatNav = () => {
        this.props.resetNodes();
    }

    renderTreeItems = () => {
        if (this.props.searchTerm && !this.props.isLoading &&  this.props.treeItems.length === 0) {
            return <span className={style.toolbarSearchNoResults}>{this.props.i18nRegistry.translate('Psmb.FlatNav:Main:noResults')}</span>
        }

        const renderedDateSections = {
            // skip current year
            [new Date().toLocaleString(undefined, {year: "numeric"})]: true
        };

        return this.props.treeItems
            .map(treeItem => {
                let dateSections = [];
                const date = new Date(Date.parse(treeItem.dateOrderedBy));
                const yearLabel = date.toLocaleString(undefined, {year: "numeric"});
                if (!renderedDateSections[yearLabel]) {
                    renderedDateSections[yearLabel] = true;
                    dateSections.push(<div className={style.treeItemYear}>{yearLabel}</div>);
                }
                const monthAndDayLabel = date.toLocaleString(undefined, {
                    month: "short", day: "numeric",
                });
                if (!renderedDateSections[monthAndDayLabel + yearLabel]) {
                    renderedDateSections[monthAndDayLabel + yearLabel] = true;
                    dateSections.push(<div className={style.treeItemDay}>{monthAndDayLabel}</div>);
                }

                if (treeItem.occupiedNode) {
                    const treeItemContextPath = treeItem.occupiedNode.contextPath;

                    // use latest state from nodeData instead of node from query
                    const nodeData = this.props.nodeData?.[treeItemContextPath];

                    if (nodeData) {
                        const isFocused = this.props.focused === treeItemContextPath;
                        const isDirty = Boolean(this.props.publishableNodes.find(i => (
                            i?.contextPath === treeItemContextPath ||
                            i?.documentContextPath === treeItemContextPath
                        )));

                        const nodeItemClassNames = mergeClassNames({
                            [style.node]: true,
                            [style.nodeFocused]: isFocused,
                            [style.nodeDirty]: isDirty,
                        })

                        return (<>
                            {dateSections}
                            <div
                                className={nodeItemClassNames}
                                key={treeItemContextPath}
                                onClick={() => {
                                    this.props.setSrc(nodeData?.uri);
                                    this.props.focus(treeItemContextPath);
                                }}
                                role="button"
                            >
                                {
                                    nodeData?.properties?._hidden ? (
                                        <span className="fa-layers fa-fw">
                                            <Icon icon="circle" color="error" transform="shrink-3" />
                                            <Icon icon="times" transform="shrink-7" />
                                        </span>
                                    ) : null
                                }
                                <span className={style.nodeLabel}>
                                    {nodeData?.label}
                                </span>
                            </div>
                        </>);
                    }
                }

                if (treeItem.nodeVariantReference) {
                    const nodeItemClassNames = mergeClassNames({
                        [style.node]: true,
                        [style.nodeForeign]: true
                    })

                    return (<>
                        {dateSections}
                        <div
                            className={nodeItemClassNames}
                            key={treeItem.nodeVariantReference.nodeAggregateId}
                            onClick={async () => {
                                const {variantWasCreated} = await this.props.nodePeerVariationHandler.transactions.start(
                                    treeItem.nodeVariantReference.nodeAggregateId,
                                    treeItem.nodeVariantReference.peerVariantOriginDimension,
                                    treeItem.nodeVariantReference.label,
                                    treeItem.nodeVariantReference.peerVariantOriginLabel,
                                );
                                if (variantWasCreated) {
                                    this.refreshFlatNav();
                                }
                            }}
                            role="button"
                        >
                            <span className={style.nodeLabel}>
                                {treeItem.nodeVariantReference.label}
                            </span>
                            <Icon icon="copy" />
                        </div>
                    </>);
                }

                return null;
            }).filter(i => i);
    };

    render() {
        const {focused, treeItems, isLoading, preset, canBeDeleted, canBeEdited} = this.props;

        const focusedInTreeItems = treeItems.find((treeItem) => treeItem.occupiedNode?.contextPath === focused);

        const searchEnabled = Boolean(preset.searchQuery)

        return (
            <div className={style.pageTreeContainer}>
                <div className={style.toolbar}>
                    <div className={style.toolbarButtons}>
                        <IconButton icon="plus" onClick={this.createNode}/>
                        <HideSelectedNode disabled={!focusedInTreeItems || !canBeEdited}/>
                        <DeleteSelectedNode disabled={!focusedInTreeItems || !canBeDeleted || !canBeEdited}/>
                        <RefreshNodes disabled={isLoading} onClick={this.refreshFlatNav}/>
                    </div>
                    {searchEnabled && <SearchInput searchTerm={this.props.searchTerm} onChange={this.props.setSearchTerm} placeholder={this.props.i18nRegistry.translate('Psmb.FlatNav:Main:search')}/>}
                </div>

                <div className={style.treeWrapper}>
                    {this.renderTreeItems()}
                    {(isLoading || (!this.props.preset.disablePagination && this.props.moreNodesAvailable && !this.props.searchTerm)) && (<Button
                        onClick={() => this.props.fetchNodes(true)}
                        style="clean"
                        className={style.loadMoreButton}
                        disabled={isLoading}
                    >
                        <div style={{textAlign: 'center'}}>
                            <Icon
                                spin={isLoading}
                                icon={isLoading ? 'spinner' : 'angle-double-down'}
                            />
                            &nbsp;{isLoading ? this.props.i18nRegistry.translate('Psmb.FlatNav:Main:loading') : this.props.i18nRegistry.translate('Psmb.FlatNav:Main:loadMore')}
                        </div>
                    </Button>)}
                </div>
            </div>
        );
    }
}
