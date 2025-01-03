<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\User;
use App\Models\Property;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    public function run(): void
    {

        $buyers = User::where('user_type', 'buyer')->pluck('id');
        $sellers = User::where('user_type', 'seller')->pluck('id');
        $properties = Property::pluck('id');


        Booking::factory()->count(30)->create(function () use ($buyers, $sellers, $properties) {
            return [
                'buyer_id' => $buyers->random(),
                'seller_id' => $sellers->random(),
                'property_id' => $properties->random(),
            ];
        });
    }
}
