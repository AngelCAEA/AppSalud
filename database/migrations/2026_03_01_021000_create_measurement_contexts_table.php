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
        Schema::create('measurement_contexts', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 50)->unique(); // Ej: 'fasting', 'post_meal', 'before_bed'
            $table->string('display_name', 100); // Ej: 'En Ayunas', 'Después de Comer'
            $table->text('description')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('measurement_contexts');
    }
};
