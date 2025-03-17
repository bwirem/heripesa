<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('facilitybranch_user', function (Blueprint $table) {            
                $table->id();
                $table->unsignedBigInteger('facilitybranch_id');  // Adjust data type if necessary
                $table->unsignedBigInteger('user_id');   // Adjust data type if necessary
                $table->timestamps();
    
                $table->foreign('facilitybranch_id')->references('id')->on('facilitybranches')->onDelete('cascade');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('facilitybranch_user');
    }
};
