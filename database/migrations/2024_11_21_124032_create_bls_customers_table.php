<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\CustomerType;



class CreateBlsCustomersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('bls_customers', function (Blueprint $table) {
            $table->id();
           // Use CustomerType::cases() to get all the customer types
           $table->enum('customer_type', array_map(fn($type) => $type->value, CustomerType::cases()))->default(CustomerType::INDIVIDUAL->value);

            // Individual Customer Fields
            $table->string('first_name')->nullable(); // Required for individuals
            $table->string('other_names')->nullable(); // Optional for individuals
            $table->string('surname')->nullable(); // Required for individuals

            // Company Customer Fields
            $table->string('company_name')->nullable(); // Required for companies

            $table->string('email')->nullable()->unique(); // Email is nullable but should be unique if provided
            $table->string('phone', 13)->nullable(); // Specify length and allow nulls

            $table->foreignId('ward_id')->nullable()->constrained('loc_wards')->onDelete('set null'); 
            $table->string('address')->nullable();

            $table->integer('stage')->default(1); //Numerical stage.

            $table->string('document_type')->nullable();
            $table->string('document_number')->nullable();
            $table->text('document_path')->nullable();

            $table->text('selfie_path')->nullable(); // Store selfie path
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
        Schema::dropIfExists('bls_customers');
    }
}