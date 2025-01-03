<?php
// app/Models/Location.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'city',
        'state',
        'country',
        'zip_code',
        'latitude',
        'longitude'
    ];

    public function properties()
    {
        return $this->hasMany(Property::class);
    }
}

