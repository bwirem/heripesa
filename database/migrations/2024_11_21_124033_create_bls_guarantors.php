<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\CustomerType;
use App\Enums\DocumentType;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('bls_guarantors', function (Blueprint $table) {
            $table->id();           
            // Use CustomerType::cases() to get all the customer types
            $table->enum('guarantor_type', array_map(fn($type) => $type->value, CustomerType::cases()))->default(CustomerType::INDIVIDUAL->value);

            // Individual Guarantor Fields
            $table->string('first_name')->nullable(); // Required for individuals
            $table->string('other_names')->nullable();
            $table->string('surname')->nullable(); // Required for individuals
            
            // Company Guarantor Fields
            $table->string('company_name')->nullable(); // Required for companies
            
            $table->string('email')->nullable()->unique(); // Email is nullable but should be unique if provided
            $table->string('phone', 13)->nullable(); // Phone number, allowing nulls             
            
            $table->foreignId('ward_id')->nullable()->constrained('loc_wards')->onDelete('set null'); // Reference to Loan Package  
            $table->string('address')->nullable();

            $table->integer('stage')->default(1); //Numerical stage.

            $table->enum('document_type', array_map(fn($type) => $type->value, DocumentType::cases()))->default(DocumentType::NIDA->value);
            
            $table->string('document_number')->nullable();
            $table->text('document_path')->nullable(); // Store document path

            $table->text('selfie_path')->nullable(); // Store selfie path

            $table->text('remarks')->nullable();
          
            $table->timestamps();
        });
        
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('bls_guarantors');
    }
};