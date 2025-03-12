<?php

namespace Database\Factories;

use App\Models\Property;
use App\Models\Location;
use Illuminate\Database\Eloquent\Factories\Factory;

class PropertyFactory extends Factory
{
    protected $model = Property::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->word() . ' Property',
            'property_image' => "https://picsum.photos/400/300?random=" . rand(1, 1000),
            'property_360_image' => "https://picsum.photos/400/300?random=" . rand(1001, 2000),
            'description' => $this->faker->sentence(),
            'price' => $this->faker->randomFloat(2, 50000, 1000000),
            'size' => $this->faker->numberBetween(50, 1000),
            'property_type' => $this->faker->randomElement(['house', 'apartment', 'villa']),
            'bedrooms' => $this->faker->numberBetween(1, 10),
            'bathrooms' => $this->faker->numberBetween(1, 5),
            'year_built' => $this->faker->year(),
            'location_id' => Location::factory(),
            'available_from' => $this->faker->date(),
            'status' => $this->faker->randomElement(['available', 'sold', 'reserved']),
        ];
    }
}
