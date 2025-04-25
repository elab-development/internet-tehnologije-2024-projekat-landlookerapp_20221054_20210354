<?php
// app/Models/Property.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'name',
        'property_image',
        'property_360_image',
        'description',
        'price',
        'size',
        'property_type',
        'bedrooms',
        'bathrooms',
        'year_built',
        'location_id',
        'available_from',
        'status'
    ];

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}

