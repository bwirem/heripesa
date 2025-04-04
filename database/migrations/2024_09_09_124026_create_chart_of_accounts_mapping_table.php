<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\AccountType; // Import the enum

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('chart_of_account_mappings', function (Blueprint $table) {
            $table->id();
            $table->string('customer_loan_code')->unique();            
            $table->string('customer_loan_interest_code');
            $table->string('customer_deposit_code');                        
            $table->softDeletes();
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chart_of_accounts_mapping');
    }
};
