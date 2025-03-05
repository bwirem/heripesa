<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BLSGuarantor extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'bls_guarantors';

    // Add attributes to $fillable array for mass assignment
    protected $fillable = [
        'guarantor_type',
        'first_name',
        'other_names',
        'surname',
        'company_name',
        'email',
        'phone',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'guarantor_type' => 'string',
    ];
}