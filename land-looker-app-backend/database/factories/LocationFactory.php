<?php

// database/factories/LocationFactory.php
namespace Database\Factories;

use App\Models\Location;
use Illuminate\Database\Eloquent\Factories\Factory;

class LocationFactory extends Factory
{
    protected $model = Location::class;

    public function definition(): array
    {
        static $i = 0;

        $capitals = [
            ['city' => 'Belgrade',   'country' => 'Serbia',                 'lat' => 44.787197, 'lng' => 20.457273],
            ['city' => 'Zagreb',     'country' => 'Croatia',                'lat' => 45.815010, 'lng' => 15.981919],
            ['city' => 'Sarajevo',   'country' => 'Bosnia and Herzegovina', 'lat' => 43.856430, 'lng' => 18.413029],
            ['city' => 'Podgorica',  'country' => 'Montenegro',             'lat' => 42.430420, 'lng' => 19.259364],
            ['city' => 'Skopje',     'country' => 'North Macedonia',        'lat' => 41.998100, 'lng' => 21.425400],
            ['city' => 'Ljubljana',  'country' => 'Slovenia',               'lat' => 46.056946, 'lng' => 14.505751],
            ['city' => 'Tirana',     'country' => 'Albania',                'lat' => 41.327953, 'lng' => 19.819025],
            ['city' => 'Athens',     'country' => 'Greece',                 'lat' => 37.983810, 'lng' => 23.727539],
            ['city' => 'Rome',       'country' => 'Italy',                  'lat' => 41.902782, 'lng' => 12.496366],
            ['city' => 'Madrid',     'country' => 'Spain',                  'lat' => 40.416775, 'lng' => -3.703790],
            ['city' => 'Paris',      'country' => 'France',                 'lat' => 48.856613, 'lng' => 2.352222],
            ['city' => 'Berlin',     'country' => 'Germany',                'lat' => 52.520008, 'lng' => 13.404954],
            ['city' => 'London',     'country' => 'United Kingdom',         'lat' => 51.507351, 'lng' => -0.127758],
            ['city' => 'Washington', 'country' => 'United States',          'lat' => 38.907192, 'lng' => -77.036873],
            ['city' => 'Ottawa',     'country' => 'Canada',                 'lat' => 45.421532, 'lng' => -75.697189],
        ];

        $pick = $capitals[$i % count($capitals)];
        $i++;

        return [
            'city'       => $pick['city'],
            // Use empty string if your column is NOT nullable; otherwise set to null
            'state'      => '', 
            'country'    => $pick['country'],
            'zip_code'   => $this->faker->postcode(),
            'latitude'   => $pick['lat'],
            'longitude'  => $pick['lng'],
        ];
    }
}

