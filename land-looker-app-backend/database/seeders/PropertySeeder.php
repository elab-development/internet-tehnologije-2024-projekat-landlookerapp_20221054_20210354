<?php

namespace Database\Seeders;

use App\Models\Property;
use App\Models\Location;
use Illuminate\Database\Seeder;

class PropertySeeder extends Seeder
{
    public function run(): void
    {

        $locations = Location::all();

        Property::factory()->count(20)->create([
            'location_id' => $locations->random()->id,
        ]);
    }
}
