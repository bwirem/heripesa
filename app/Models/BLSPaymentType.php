<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BLSPaymentType extends Model
{
    protected $table = 'bls_paymenttypes';  // Specify table name
    protected $fillable = ['name', 'preventoverpay', 'ischeque', 'allowrefund', 'issaving', 'paymentreference']; // For mass assignment (if needed)

    // Add casts as needed (e.g., boolean for 'preventoverpay', etc.)
    protected $casts = [
        'preventoverpay' => 'boolean',
        'ischeque' => 'boolean',
        'allowrefund' => 'boolean',
        'issaving' => 'boolean',
    ];
}