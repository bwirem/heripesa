<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\CustomerType;
use App\Enums\DocumentType;


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
        'stage',
        'document_type',
        'document_number',
        'document_path',
        'selfie_path',
        'remarks',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'guarantor_type' => 'string',
        'document_type' => 'string',
    ];

    // Accessor to get the human-readable label
    public function getGuarantorTypeNameAttribute()
    {
        return CustomerType::from($this->guarantor_type)->label();
    }

    // Accessor to get the human-readable label
    public function getDocumentTypeNameAttribute()
    {
        return DocumentType::from($this->document_type)->label();
    }

}