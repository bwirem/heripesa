<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

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
            $table->enum('customer_type', ['individual', 'company'])->default('individual'); // Indicate if it's an individual or company

            // Individual Customer Fields
            $table->string('first_name')->nullable(); // Required for individuals
            $table->string('other_names')->nullable(); // Optional for individuals
            $table->string('surname')->nullable(); // Required for individuals

            // Company Customer Fields
            $table->string('company_name')->nullable(); // Required for companies

            $table->string('email')->nullable()->unique(); // Email is nullable but should be unique if provided
            $table->string('phone', 13)->nullable(); // Specify length and allow nulls
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