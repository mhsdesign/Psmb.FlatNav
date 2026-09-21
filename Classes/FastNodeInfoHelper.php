<?php

declare(strict_types=1);

namespace Psmb\FlatNav;

use Neos\ContentRepository\Core\Projection\ContentGraph\Node;
use Neos\Flow\Mvc\ActionRequest;
use Neos\Neos\Ui\Fusion\Helper\NodeInfoHelper;

class FastNodeInfoHelper extends NodeInfoHelper
{
    public function getMinimalFastNodeInformation(Node $node, ActionRequest $actionRequest): array
    {
        $nodeInfo = $this->getBasicNodeInformation($node);
        $nodeInfo['properties'] = $this->nodePropertyConverterService->getPropertiesArray($node);
        $nodeInfo['tags'] = $node->tags;
        // $nodeInfo['isFullyLoaded'] = false; implicit

        $nodeInfo = array_merge($nodeInfo, $this->getUriInformation($node, $actionRequest));

        return $nodeInfo;
    }
}
