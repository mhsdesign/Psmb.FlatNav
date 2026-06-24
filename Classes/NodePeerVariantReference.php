<?php

declare(strict_types=1);

namespace Psmb\FlatNav;

use Neos\ContentRepository\Core\DimensionSpace\OriginDimensionSpacePoint;
use Neos\ContentRepository\Core\SharedModel\Node\NodeAggregateId;
use Psr\Http\Message\UriInterface;

final readonly class NodePeerVariantReference
{
    public function __construct(
        public NodeAggregateId $nodeAggregateId,
        public OriginDimensionSpacePoint $peerVariantOriginDimensionSpacePoint,
        public string $label,
        public string $peerVariantOriginLabel,
    ) {
    }

    /** @return array<int|string,mixed> */
    public function toArrayWithPeerVariantOriginPreviewUri(UriInterface $peerVariantOriginPreviewUri): mixed
    {
        return [
            'nodeAggregateId' => $this->nodeAggregateId,
            'peerVariantOriginDimension' => $this->peerVariantOriginDimensionSpacePoint->toLegacyDimensionArray(),
            'label' => $this->label,
            'peerVariantOriginLabel' => $this->peerVariantOriginLabel,
            'peerVariantOriginPreviewUri' => $peerVariantOriginPreviewUri->__toString(),
        ];
    }
}
