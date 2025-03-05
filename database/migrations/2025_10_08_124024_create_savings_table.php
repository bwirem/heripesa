<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use App\Enums\SavingsStatus;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('savings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('bls_customers')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->decimal('balance', 10, 2)->default(0);
            $table->decimal('interest_rate', 5, 2)->default(0); // Added interest rate
            $table->decimal('accrued_interest', 10, 2)->default(0);  // Added accrued interest
            $table->tinyInteger('status')->default(SavingsStatus::Active->value); // Use tinyInteger
            $table->softDeletes(); // Use soft deletes
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('savings');
    }
};
