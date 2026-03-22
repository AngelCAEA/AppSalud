<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MeasurementContextSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('measurement_contexts')->insert([
            [
                'slug' => 'fasting',
                'display_name' => 'En Ayunas',
                'description' => 'Medición realizada después de 8-12 horas sin comer',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'post_meal',
                'display_name' => 'Después de Comer',
                'description' => 'Medición realizada 2 horas después de la comida',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'before_bed',
                'display_name' => 'Antes de Dormir',
                'description' => 'Medición realizada antes de acostarse',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'random',
                'display_name' => 'Aleatorio',
                'description' => 'Medición realizada en cualquier momento del día',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
