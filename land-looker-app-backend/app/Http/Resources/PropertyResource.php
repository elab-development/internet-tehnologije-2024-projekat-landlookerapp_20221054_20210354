<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'property_image' => $this->property_image,
            'property_360_image' => $this->property_360_image,
            'description' => $this->description,
            'price' => $this->price,
            'size' => $this->size,
            'property_type' => $this->property_type,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'year_built' => $this->year_built,
            'location_id' => $this->location_id,
            'location' => $this->whenLoaded('location', function () {
                return [
                    'name' => trim(($this->location->city ?? '').', '.($this->location->state ?? '').', '.($this->location->country ?? '')),
                    'latitude' => (float) $this->location->latitude,
                    'longitude'=> (float) $this->location->longitude,
                ];
            }),
            'available_from' => $this->available_from,
            'status' => $this->status,
        ];
    }
}
