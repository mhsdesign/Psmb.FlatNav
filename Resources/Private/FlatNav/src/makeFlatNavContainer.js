import React, {Component} from 'react';
import {Tabs} from '@neos-project/react-ui-components';
import {connect} from 'react-redux';
import {actions} from '@neos-project/neos-ui-redux-store';
import {neos} from '@neos-project/neos-ui-decorators';
import {fetchWithErrorHandling} from '@neos-project/neos-ui-backend-connector';
import FlatNav from './FlatNav';
import style from './style.module.css';
import debounce from './Helper/debounce';

const makeFlatNavContainer = (OriginalPageTree, nodePeerVariationHandler) => {
    class FlatNavContainer extends Component {
        state = {};

        constructor(props) {
            super(props);
            this.state = this.buildDefaultState(props);

            // It's not safe to rely on React's state to do the locking
            this.loadingLock = {};
        }

        componentDidUpdate(prevProps) {
            // If the siteNodeContextPath or baseWorkspaceName have changed, fully reset the state
            if (
                this.props.siteNodeContextPath !== prevProps.siteNodeContextPath ||
                this.props.baseWorkspaceName !== prevProps.baseWorkspaceName
            ) {
                this.fullReset();
            }
        }

        buildDefaultState = props => {
            const state = {};
            Object.keys(props.options.presets).forEach(presetName => {
                state[presetName] = {
                    page: 1,
                    isLoading: false,
                    treeItems: [],
                    searchTerm: '',
                    includePeerVariants: true,
                    moreNodesAvailable: true
                };
            });
            return state;
        };

        fullReset = () => {
            const defaultState = this.buildDefaultState(this.props);
            this.setState({
                ...defaultState
            });
        }

        makeResetNodes = (preset, fetchNodes) => () => {
            this.setState({
                [preset]: {
                    ...this.state[preset],
                    page: 1,
                    treeItems: [],
                    moreNodesAvailable: true
                }
            }, fetchNodes);
        }

        makeFetchNodes = preset => (loadMore = false) => {
            const searchTerm = this.state[preset].searchTerm;
            const includePeerVariants = this.state[preset].includePeerVariants;
            const page = loadMore ? this.state[preset].page + 1 : 1

            const params = new URLSearchParams({
                'nodeContextPath': this.props.siteNodeContextPath,
                'preset': preset,
                'page': page,
            });

            if (searchTerm) {
                params.set('searchTerm', searchTerm);
            }

            if (includePeerVariants) {
                params.set('includePeerVariants', '1');
            }

            const url = `/neos/flatnav/query?${params.toString()}`
            if (this.loadingLock[url]) {
                return;
            }
            this.loadingLock[url] = true;
            this.setState({
                [preset]: {
                    ...this.state[preset],
                    isLoading: true,
                    moreNodesAvailable: true
                }
            });

            fetchWithErrorHandling.withCsrfToken(csrfToken => ({
                url,
                method: 'GET',
                credentials: 'include',
                headers: {
                    'X-Flow-Csrftoken': csrfToken,
                    'Content-Type': 'application/json'
                }
            }))
                .then(response => response && response.json())
                .then(treeItems => {
                    // Ignore the response if the searchTerm has changed while request was running
                    if (searchTerm === this.state[preset].searchTerm && includePeerVariants === this.state[preset].includePeerVariants) {
                        if (treeItems.length > 0) {
                            const nodesMap = treeItems.reduce((result, treeItem) => {
                                if (treeItem.occupiedNode) {
                                    result[treeItem.occupiedNode.contextPath] = treeItem.occupiedNode;
                                }
                                return result;
                            }, {});
                            this.props.merge(nodesMap);
                            this.setState({
                                [preset]: {
                                    ...this.state[preset],
                                    isLoading: false,
                                    treeItems: loadMore ? [...this.state[preset].treeItems, ...treeItems] : treeItems,
                                    page,
                                    moreNodesAvailable: true
                                }
                            });
                        } else {
                            this.setState({
                                [preset]: {
                                    ...this.state[preset],
                                    isLoading: false,
                                    moreNodesAvailable: false,
                                    treeItems: loadMore ? this.state[preset].treeItems : [],
                                }
                            });
                        }
                        this.loadingLock[url] = false;
                    }
                });
        };

        makeSetSearchTerm = (preset, fetchNodes) => searchTerm => {
            this.setState({
                [preset]: {
                    ...this.state[preset],
                    treeItems: [],
                    page: 1,
                    isLoading: true,
                    searchTerm
                }
            }, fetchNodes);
        }

        makeToggleIncludePeerVariants = (preset, fetchNodes) => () => {
            this.setState((prev) => ({
                [preset]: {
                    ...prev[preset],
                    treeItems: [],
                    page: 1,
                    isLoading: true,
                    includePeerVariants: !prev[preset].includePeerVariants
                }
            }), fetchNodes);
        }

        render() {
            return (
                <Tabs theme={{
                    tabs__content: style.tabsContent,
                    tabs__panel: style.tabsPanel
                }}>
                    {Object.keys(this.props.options.presets).map(presetName => {
                        const preset = this.props.options.presets[presetName];
                        if (!preset) {
                            return null;
                        }
                        if (preset.disabled) {
                            return null;
                        }
                        const fetchNodes = this.makeFetchNodes(presetName)
                        const resetNodes = this.makeResetNodes(presetName, fetchNodes)
                        const debouncedFetchNodes = debounce(fetchNodes, 400);
                        const setSearchTerm = this.makeSetSearchTerm(presetName, debouncedFetchNodes)
                        const toggleIncludePeerVariants = this.makeToggleIncludePeerVariants(presetName, debouncedFetchNodes)
                        return (
                            <Tabs.Panel id={presetName} key={presetName} icon={preset.icon} tooltip={this.props.i18nRegistry.translate(preset.label)} theme={{
                                panel: style.panel
                            }}>
                                {preset.type === 'flat' && (<FlatNav
                                    nodePeerVariationHandler={nodePeerVariationHandler}
                                    preset={preset}
                                    fetchNodes={fetchNodes}
                                    resetNodes={resetNodes}
                                    setSearchTerm={setSearchTerm}
                                    toggleIncludePeerVariants={toggleIncludePeerVariants}
                                    fullReset={this.fullReset}
                                    {...this.state[presetName]}
                                />)}
                                {preset.type === 'tree' && (<OriginalPageTree />)}
                            </Tabs.Panel>
                        );
                    }).filter(Boolean)}
                </Tabs>
            );
        }
    }
    return neos(globalRegistry => ({
        options: globalRegistry.get('frontendConfiguration').get('Psmb_FlatNav'),
        i18nRegistry: globalRegistry.get('i18n')
    }))(connect(state => ({
        siteNodeContextPath: state?.cr?.nodes?.siteNode,
        baseWorkspaceName: state?.cr?.workspaces?.personalWorkspace?.baseWorkspace
    }), {
        merge: actions.CR.Nodes.merge
    })(FlatNavContainer));
};

export default makeFlatNavContainer;
