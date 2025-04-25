<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\User;
use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;

class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        return [
            'property_id' => Property::factory(),
            'buyer_id' => User::factory()->state(['user_type' => 'buyer']),
            'worker_id' => User::factory()->state(['user_type' => 'worker']),
            'booking_date' => $this->faker->dateTimeBetween('2025-01-01', '2025-12-31')->format('Y-m-d'),
            'status' => $this->faker->randomElement(['pending', 'confirmed', 'cancelled']),
            'total_price' => $this->faker->randomFloat(2, 100000, 1000000),
            'payment_method' => $this->faker->randomElement(['credit_card', 'bank_transfer', 'paypal']),
        ];
    }
}
