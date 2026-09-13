<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Database heartbeat to keep Supabase connection alive
Schedule::call(function () {
    try {
        DB::select('SELECT 1');
        Log::info('Database heartbeat successful');
    } catch (\Exception $e) {
        Log::error('Database heartbeat failed', [
            'exception' => $e->getMessage(),
            'code' => $e->getCode(),
        ]);
        // TODO: Agregar notificación a administrador (email, Slack, etc.)
    }
})->everyMinute();