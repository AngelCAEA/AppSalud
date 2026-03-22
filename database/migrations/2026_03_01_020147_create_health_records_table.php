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
        Schema::create('health_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('users')->onDelete('cascade');
            $table->enum('type', ['glucose', 'blood_pressure']);
            
            // Campos para Glucosa
            $table->decimal('glucose_value', 5, 2)->nullable();
            
            // Campos para Presión Arterial
            $table->smallInteger('systolic')->nullable();
            $table->smallInteger('diastolic')->nullable();
            $table->smallInteger('pulse')->nullable();
            
            $table->text('notes')->nullable();
            $table->timestamp('recorded_at');
            $table->timestamp('created_at')->useCurrent();
        });
        
        // Índices para rendimiento
        Schema::table('health_records', function (Blueprint $table) {
            $table->index(['patient_id', 'recorded_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('health_records');
    }
};
