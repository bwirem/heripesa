<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use App\Enums\TransactionType;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('bls_customers')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('loan_id')->nullable()->constrained('loans')->onDelete('cascade');
            $table->foreignId('savings_id')->nullable()->constrained('savings')->onDelete('cascade');
            $table->foreignId('expensepost_id')->nullable()->constrained('exp_expensepost')->onDelete('set null'); // 
            $table->decimal('amount', 10, 2);
            $table->tinyInteger('type')->default(TransactionType::Deposit->value); // Use tinyInteger for efficiency
            $table->foreignId('payment_type_id')->nullable()->constrained('bls_paymenttypes')->onDelete('set null'); // Add the foreign key
            $table->string('transaction_reference')->unique(); // Added for unique transaction ID
            $table->text('description')->nullable(); // Added for transaction description
            $table->softDeletes(); // Use soft deletes
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
