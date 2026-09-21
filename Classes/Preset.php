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

    /** @param array<int|string,mixed> $array */
    public static function fromArray(array $array): self
    {
        return new self(
            parentNodeAggregateId: NodeAggregateId::fromString($array['parentNodeAggregateId']),
            newNodeTypeName: isset($array['newNodeType']) ? NodeTypeName::fromString($array['newNodeType']) : null,
        );
    }
}
