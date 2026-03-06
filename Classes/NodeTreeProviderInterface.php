<?php

namespace Psmb\FlatNav;

use Neos\ContentRepository\Core\Projection\ContentGraph\Node;

interface NodeTreeProviderInterface
{
    public function provideItems(Node $parentNode, int $page, ?string $searchTerm): TreeItemSet;
}
