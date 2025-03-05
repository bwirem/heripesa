<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

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
            $table->enum('guarantor_type', ['individual', 'company'])->default('individual'); // Individual or company guarantor
            
            // Individual Guarantor Fields
            $table->string('first_name')->nullable(); // Required for individuals
            $table->string('other_names')->nullable();
            $table->string('surname')->nullable(); // Required for individuals
            
            // Company Guarantor Fields
            $table->string('company_name')->nullable(); // Required for companies
            
            $table->string('email')->nullable()->unique(); // Email is nullable but should be unique if provided
            $table->string('phone', 13)->nullable(); // Phone number, allowing nulls            
          
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