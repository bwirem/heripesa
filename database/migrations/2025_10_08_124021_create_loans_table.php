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
        Schema::create('loans', function (Blueprint $table) {
            $table->id();
            $table->enum('customer_type', ['individual', 'company'])->default('individual');
            $table->string('first_name')->nullable();
            $table->string('other_names')->nullable();
            $table->string('surname')->nullable();
            $table->string('company_name')->nullable();
            $table->string('email');
            $table->string('phone', 13)->nullable();
            $table->foreignId('customer_id')->nullable()->constrained('bls_customers')->onDelete('set null');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('loan_type')->nullable()->constrained('bls_packages')->onDelete('set null'); // Reference to Loan Package
           
            $table->decimal('loan_amount', 10, 2);
            $table->integer('loan_duration');
            $table->decimal('interest_rate', 5, 2);
            $table->decimal('interest_amount', 10, 2)->default(0); // Amount of interest
            $table->decimal('monthly_repayment', 10, 2)->default(0); // Monthly payment
            $table->decimal('total_repayment', 10, 2);
            $table->integer('stage')->default(1); //Numerical stage.
            $table->string('application_form')->nullable(); // Path to the uploaded application form
            $table->enum('status', ['draft', 'submitted', 'approved', 'disbursed', 'repaid', 'defaulted'])->default('draft'); //Add draft stage.
            $table->text('submit_remarks')->nullable();
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loans');
    }
};