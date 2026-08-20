<?php
declare(strict_types=1);

namespace Psmb\FlatNav;

use Neos\ContentRepository\Core\NodeType\NodeTypeName;
use Neos\ContentRepository\Core\SharedModel\Node\NodeAggregateId;
use Neos\Flow\Annotations as Flow;

#[Flow\Proxy(false)]
final readonly class Preset
{
    public function __construct(
        public NodeAggregateId $parentNodeAggregateId,
        public ?NodeTypeName $newNodeTypeName,
    ) {
    }
}
