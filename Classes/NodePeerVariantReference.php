<?php

declare(strict_types=1);

namespace Psmb\FlatNav;

use Neos\ContentRepository\Core\DimensionSpace\OriginDimensionSpacePoint;
use Neos\ContentRepository\Core\SharedModel\Node\NodeAggregateId;

final readonly class NodePeerVariantReference implements \JsonSerializable
{
    public function __construct(
        public NodeAggregateId $nodeAggregateId,
        public OriginDimensionSpacePoint $peerVariantOriginDimensionSpacePoint,
        public string $label
    ) {
    }

    /** @return array<int|string,mixed> */
    public function jsonSerialize(): mixed
    {
        return [
            'nodeAggregateId' => $this->nodeAggregateId,
            'peerVariantOriginDimensionSpacePoint' => $this->peerVariantOriginDimensionSpacePoint->toLegacyDimensionArray(),
            'label' => $this->label,
        ];
    }
}
