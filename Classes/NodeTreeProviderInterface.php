<?php

namespace Psmb\FlatNav;

use Neos\ContentRepository\Core\SharedModel\Node\NodeAddress;

interface NodeTreeProviderInterface
{
    public function provideItems(NodeAddress $siteNodeAddress, int $page, ?string $searchTerm, bool $includePeerVariants): TreeItemSet;
}
