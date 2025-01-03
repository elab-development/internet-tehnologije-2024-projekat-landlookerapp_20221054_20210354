<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone_number' => $this->phone_number,
            'address' => $this->address,
            'user_type' => $this->user_type,
            'bookings_as_buyer' => $this->whenLoaded('bookingsAsBuyer'),
            'bookings_as_seller' => $this->whenLoaded('bookingsAsSeller'),
        ];
    }
}
