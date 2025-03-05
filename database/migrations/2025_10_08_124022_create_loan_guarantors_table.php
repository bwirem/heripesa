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
        Schema::create('loan_guarantors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('loan_id')->constrained('loans')->onDelete('cascade'); // Enforce loan association
            $table->foreignId('guarantor_id')->nullable()->constrained('bls_guarantors')->onDelete('set null');
            $table->string('collateral_doc')->nullable(); // Path to the uploaded collateral doc
            $table->string('collateral_docname')->nullable();
            $table->timestamps();

            $table->unique(['loan_id', 'guarantor_id']); // Prevent duplicate guarantor assignments to the same loan
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loan_guarantors');
    }
};
