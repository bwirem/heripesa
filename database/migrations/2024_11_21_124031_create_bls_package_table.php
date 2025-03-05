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
            $table->decimal('interest_rate', 5, 2);
            $table->integer('duration'); // Duration in months            
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
