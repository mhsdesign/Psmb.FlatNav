<?php

declare(strict_types=1);

namespace Psmb\FlatNav;

final readonly class TreeItemSet
{
    /** @var array<TreeItem> */
    public array $items;

    private function __construct(
        TreeItem ...$items
    ) {
        $this->items = $items;
    }

    public static function create(TreeItem ...$items): self
    {
        return new self(...$items);
    }

    /** @param array<TreeItem> $array */
    public static function fromArray(array $array): self
    {
        return new self(...$array);
    }
}
