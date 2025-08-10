<?php

// app/Http/Controllers/LocationController.php
namespace App\Http\Controllers;

use App\Models\Location;

class LocationController extends Controller
{
    public function index()
    {
        $rows = Location::select(
                'id',
                'city',
                'state',
                'country',
                'zip_code',
                'latitude',
                'longitude'
            )
            ->orderBy('city')
            ->get()
            ->map(function ($l) {
                // Synthetic "name" za dropdown (city, state, country)
                $parts = array_filter([$l->city, $l->state, $l->country]);
                return [
                    'id'        => $l->id,
                    'name'      => implode(', ', $parts),
                    'city'      => $l->city,
                    'state'     => $l->state,
                    'country'   => $l->country,
                    'zip_code'  => $l->zip_code,
                    'latitude'  => $l->latitude,
                    'longitude' => $l->longitude,
                ];
            });

        return response()->json($rows);
    }
}
