<?php

namespace Database\Seeders;

use App\Models\Property;
use App\Models\Location;
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Factories\Sequence;

class PropertySeeder extends Seeder
{
    public function run(): void
    {
        $want = 20;

        // Make sure we have at least $want locations; create extras if needed.
        $have = Location::count();
        if ($have < $want) {
            Location::factory()->count($want - $have)->create();
        }

        // Take $want distinct location IDs in random order.
        $ids = Location::query()
            ->inRandomOrder()
            ->limit($want)
            ->pluck('id')
            ->values();

        // Create exactly $ids->count() properties and assign a different location to each.
        Property::factory()
            ->count($ids->count())
            ->sequence(fn ($seq) => ['location_id' => $ids[$seq->index]])
            ->create();
    }
}
