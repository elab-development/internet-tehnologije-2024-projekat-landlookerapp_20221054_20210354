<?php

namespace App\Exports;

use App\Models\Booking;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class BookingsExport implements FromCollection, WithHeadings
{
    protected $buyerId;

    public function __construct($buyerId)
    {
        $this->buyerId = $buyerId;
    }

    public function collection()
    {
        return Booking::where('buyer_id', $this->buyerId)->get([
            'id',
            'property_id',
            'booking_date',
            'status',
            'total_price',
            'payment_method'
        ]);
    }

    public function headings(): array
    {
        return ['ID', 'Property ID', 'Booking Date', 'Status', 'Total Price', 'Payment Method'];
    }
}
