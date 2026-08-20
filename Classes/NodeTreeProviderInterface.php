<?php

namespace Psmb\FlatNav;

interface NodeTreeProviderInterface
{
    public function provideItems(NodeTreeQuery $query): TreeItemSet;
}
