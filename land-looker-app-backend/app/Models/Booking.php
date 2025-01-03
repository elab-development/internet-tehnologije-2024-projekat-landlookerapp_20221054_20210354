<?php
// app/Models/Booking.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'property_id',
        'buyer_id',
        'seller_id',
        'booking_date',
        'status',
        'total_price',
        'payment_method'
    ];

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function property()
    {
        return $this->belongsTo(Property::class);
    }
}

