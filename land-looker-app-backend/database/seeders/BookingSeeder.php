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
        $workers = User::where('user_type', 'worker')->pluck('id');
        $properties = Property::pluck('id');


        Booking::factory()->count(30)->create(function () use ($buyers, $workers, $properties) {
            return [
                'buyer_id' => $buyers->random(),
                'worker_id' => $workers->random(),
                'property_id' => $properties->random(),
            ];
        });
    }
}
