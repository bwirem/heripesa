<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use App\Enums\ExpenseStage; // Assuming you created this enum

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('exp_expensepost', function (Blueprint $table) {
            $table->id();
            $table->date('transdate');
            $table->timestamp('sysdate')->useCurrent();           
            $table->string('description');   
            $table->foreignId('facilityoption_id')->constrained('facilityoptions')->onDelete('cascade');        
            $table->tinyInteger('stage')->default(ExpenseStage::Pending->value);
            $table->index('stage'); // Add an index for 'stage'
            $table->decimal('total', 10, 2); // Total order amount  
            $table->string('payment_method')->nullable();
            $table->string('vendor')->nullable();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exp_expensepost');
    }
};
