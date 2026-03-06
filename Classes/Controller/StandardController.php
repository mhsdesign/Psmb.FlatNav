<?php
namespace Psmb\FlatNav\Controller;

use Neos\ContentRepository\Core\DimensionSpace\OriginDimensionSpacePoint;
use Neos\ContentRepository\Core\Projection\ContentGraph\Node;
use Neos\ContentRepository\Core\SharedModel\Node\NodeAddress;
use Neos\ContentRepositoryRegistry\ContentRepositoryRegistry;
use Neos\Eel\Utility;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Mvc\Controller\ActionController;
use Neos\Flow\Mvc\View\JsonView;
use Neos\Neos\Ui\Fusion\Helper\NodeInfoHelper;
use Psmb\FlatNav\NodePeerVariantReference;
use Psmb\FlatNav\NodeTreeProviderInterface;

class StandardController extends ActionController
{
    /**
     * @var array
     */
    protected $viewFormatToObjectNameMap = [
        'html' => JsonView::class
    ];

    /**
     * @Flow\InjectConfiguration(package="Neos.Neos.Ui", path="frontendConfiguration.Psmb_FlatNav.presets")
     * @var array
     */
    protected $presets;

    /**
     * @Flow\InjectConfiguration(package="Neos.Fusion", path="defaultContext")
     * @var array
     */
    protected $defaultContextConfiguration;

    /**
     * @Flow\Inject(lazy=false)
     * @var \Neos\Eel\EelEvaluatorInterface
     */
    protected $eelEvaluator;

    /**
     * @Flow\Inject
     * @var ContentRepositoryRegistry
     */
    protected $contentRepositoryRegistry;

    /**
     * @param string $preset The preset, configured in Settings.yaml
     * @param string $nodeContextPath The node address of the site
     * @param integer $page Page parameter used for pagination
     * @param string $searchTerm Search term
     * @return void
     * @throws \Neos\Eel\Exception
     * @Flow\SkipCsrfProtection
     */
    public function queryAction($preset, $nodeContextPath, $page = 1, $searchTerm = null)
    {
        if (!isset($this->presets[$preset])) {
            throw new \Exception('Invalid preset name');
        }

        $nodeAddress = NodeAddress::fromJsonString($nodeContextPath);
        $contentRepository = $this->contentRepositoryRegistry->get($nodeAddress->contentRepositoryId);
        $subgraph = $contentRepository->getContentSubgraph($nodeAddress->workspaceName, $nodeAddress->dimensionSpacePoint);

        $baseNode = $subgraph->findNodeById($nodeAddress->aggregateId);

        /** @var class-string<NodeTreeProviderInterface> $nodeTreeProviderClassName */
        $nodeTreeProviderClassName = $this->presets[$preset]['nodeTreeProviderClassName'];
        /** @var NodeTreeProviderInterface $nodeTreeProvider */
        $nodeTreeProvider = $this->objectManager->get($nodeTreeProviderClassName);
        $nodeTreeItems = $nodeTreeProvider->provideItems($baseNode, $page, $searchTerm);

        $nodeInfoHelper = new NodeInfoHelper();
        $result = [];
        foreach ($nodeTreeItems->items as $nodeTreeItem) {
            $item = [];
            if ($nodeTreeItem->node instanceof Node) {
                $serializedNode = $nodeInfoHelper->renderNodeWithMinimalPropertiesAndChildrenInformation($nodeTreeItem->node, $this->request);
                $item['occupiedNode'] = $serializedNode;
            }
            if ($nodeTreeItem->node instanceof NodePeerVariantReference) {
                $item['nodeVariantReference'] = $nodeTreeItem->node->jsonSerialize();
            }

            $item['occupiedDimensions'] = array_map(
                fn (OriginDimensionSpacePoint $originDimensionSpacePoint) => $originDimensionSpacePoint->toLegacyDimensionArray(),
                array_values($nodeTreeItem->occupiedDimensionSpacePoints->getPoints())
            );

            $result[] = $item;
        }
        $this->view->assign('value', $result);
        return;

        $isSearch = $searchTerm && $this->presets[$preset]['searchQuery'];
        if ($isSearch) {
            $expression = '${' . $this->presets[$preset]['searchQuery'] . '}';
        } else {
            $expression = '${' . $this->presets[$preset]['query'] . '}';
        }
        if ($isSearch) {
            $contextVariables = [
                'node' => $baseNode,
                'site' => $baseNode,
                'page' => $page,
                'searchTerm' => $searchTerm
            ];
        } else {
            $contextVariables = [
                'node' => $baseNode,
                'site' => $baseNode,
                'page' => $page
            ];
        }

        $nodes = Utility::evaluateEelExpression($expression, $this->eelEvaluator, $contextVariables, $this->defaultContextConfiguration);
        $nodeInfoHelper = new NodeInfoHelper();

        $result = [];
        foreach ($nodes as $node) {
            $nodeInfo = $nodeInfoHelper->renderNodeWithMinimalPropertiesAndChildrenInformation($node, $this->request);
            $result[] = $nodeInfo;
        }
        $this->view->assign('value', $result);
    }

    /**
     * @param string $preset The preset, configured in Settings.yaml
     * @param string $nodeContextPath The node address of the site
     * @return void
     * @throws \Neos\Eel\Exception
     * @Flow\SkipCsrfProtection
     */
    public function getNewReferenceNodePathAction($preset, $nodeContextPath)
    {
        if (!isset($this->presets[$preset])) {
            throw new \Exception('Invalid preset name', 1660762934);
        }

        $nodeAddress = NodeAddress::fromJsonString($nodeContextPath);
        $contentRepository = $this->contentRepositoryRegistry->get($nodeAddress->contentRepositoryId);
        $subgraph = $contentRepository->getContentSubgraph($nodeAddress->workspaceName, $nodeAddress->dimensionSpacePoint);

        $baseNode = $subgraph->findNodeById($nodeAddress->aggregateId);
        if(isset($this->presets[$preset]['newReferenceNodePath'])) {
            $expression = '${' . $this->presets[$preset]['newReferenceNodePath'] . '}';
            $contextVariables = [
                'node' => $baseNode,
                'site' => $baseNode
            ];
            $newReferenceNode = Utility::evaluateEelExpression($expression, $this->eelEvaluator, $contextVariables, $this->defaultContextConfiguration);
            if (!$newReferenceNode instanceof Node) {
                throw new \RuntimeException(sprintf('Expected expression "%s" to evaluate to a node got "%s"', $expression, is_scalar($newReferenceNode) ? $newReferenceNode : get_debug_type($newReferenceNode)), 1767604672);
            }
        } else {
            $newReferenceNode = $baseNode;
        }

        $this->view->assign('value', NodeAddress::fromNode($newReferenceNode)->toJson());
    }
}
