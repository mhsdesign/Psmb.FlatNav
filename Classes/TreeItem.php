<?php

declare(strict_types=1);

namespace Psmb\FlatNav;

use Neos\ContentRepository\Core\DimensionSpace\OriginDimensionSpacePointSet;
use Neos\ContentRepository\Core\Projection\ContentGraph\Node;
use Neos\Flow\Annotations as Flow;

#[Flow\Proxy(false)]
final readonly class TreeItem
{
    public function __construct(
        public Node|NodePeerVariantReference $node,
        public OriginDimensionSpacePointSet $occupiedDimensionSpacePoints
    ) {
    }
}
