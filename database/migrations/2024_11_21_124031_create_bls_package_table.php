<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('bls_packages', function (Blueprint $table) {
            $table->id();           
            $table->string('name');
            $table->string('interest_type');
            $table->decimal('interest_rate', 6, 2); // Increased precision for interest rates
            $table->integer('duration'); 
            $table->enum('duration_unit', ['days', 'months', 'years'])->default('months'); // NEW: Unit for duration
            $table->timestamps();
        });
        
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bls_packages');
    }
};
