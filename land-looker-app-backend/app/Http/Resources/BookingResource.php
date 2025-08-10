<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'property_id' => $this->property_id,
            'booking_date' => $this->booking_date,
            'status' => $this->status,
            'total_price' => $this->total_price,
            'payment_method' => $this->payment_method,
            'buyer' => new UserResource($this->whenLoaded('buyer')),
            'worker'   => $this->when(
                $this->relationLoaded('worker'),
                fn () => ['id' => $this->worker->id, 'name' => $this->worker->name]
            ),
            'property' => new PropertyResource($this->whenLoaded('property')),
        ];
    }
}
