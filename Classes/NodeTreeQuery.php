<?php
declare(strict_types=1);

namespace Psmb\FlatNav;

use Neos\ContentRepository\Core\SharedModel\Node\NodeAddress;
use Neos\Flow\Annotations as Flow;

#[Flow\Proxy(false)]
final readonly class NodeTreeQuery
{
    public function __construct(
        public NodeAddress $siteNodeAddress,
        public int $page,
        public ?string $searchTerm,
        public bool $includePeerVariants,
        public Preset $preset,
    ) {
    }
}
