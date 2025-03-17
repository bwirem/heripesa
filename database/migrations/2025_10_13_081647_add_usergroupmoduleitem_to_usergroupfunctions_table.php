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
        Schema::table('usergroupfunctions', function (Blueprint $table) {
            $table->foreignId('usergroupmoduleitem_id')->nullable()->constrained('usergroupmoduleitems')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('usergroupfunctions', function (Blueprint $table) {
            $table->dropForeign(['usergroupmoduleitem_id']);
            $table->dropColumn('usergroupmoduleitem_id');
        });
    }
};
