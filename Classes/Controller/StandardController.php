<?php
namespace Psmb\FlatNav\Controller;

use GuzzleHttp\Psr7\Response;
use Neos\ContentRepository\Core\DimensionSpace\OriginDimensionSpacePoint;
use Neos\ContentRepository\Core\Projection\ContentGraph\Node;
use Neos\ContentRepository\Core\SharedModel\Node\NodeAddress;
use Neos\ContentRepositoryRegistry\ContentRepositoryRegistry;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Mvc\Controller\ActionController;
use Neos\Neos\Ui\Fusion\Helper\NodeInfoHelper;
use Psmb\FlatNav\NodePeerVariantReference;
use Psmb\FlatNav\NodeTreeProviderInterface;
use Psr\Http\Message\ResponseInterface;

class StandardController extends ActionController
{
    /**
     * @Flow\InjectConfiguration(package="Neos.Neos.Ui", path="frontendConfiguration.Psmb_FlatNav.presets")
     * @var array
     */
    protected $presets;

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
     */
    public function queryAction($preset, $nodeContextPath, $page = 1, $searchTerm = null): ResponseInterface
    {
        if (!isset($this->presets[$preset])) {
            throw new \Exception('Invalid preset name');
        }

        $siteNodeAddress = NodeAddress::fromJsonString($nodeContextPath);

        /** @var class-string<NodeTreeProviderInterface> $nodeTreeProviderClassName */
        $nodeTreeProviderClassName = $this->presets[$preset]['nodeTreeProviderClassName'];
        /** @var NodeTreeProviderInterface $nodeTreeProvider */
        $nodeTreeProvider = $this->objectManager->get($nodeTreeProviderClassName);
        $nodeTreeItems = $nodeTreeProvider->provideItems($siteNodeAddress, $page, $searchTerm);

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

            $item['dateOrderedBy'] = $nodeTreeItem->dateOrderedBy->format(\DateTimeInterface::W3C);

            $result[] = $item;
        }

        return new Response(
            headers: ['Content-Type' => 'application/json'],
            body: json_encode($result)
        );
    }
}
