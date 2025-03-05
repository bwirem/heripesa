<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BLSCustomer extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'bls_customers';

    // Add attributes to $fillable array for mass assignment
    protected $fillable = [
        'customer_type',
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
        'customer_type' => 'string',
    ];


    public function savings()
    {        
        return $this->hasMany(Saving::class, 'customer_id', 'id');              
    }
}