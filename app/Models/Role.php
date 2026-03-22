<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Role extends Model
{
    use HasFactory;

    protected $table = 'role';

    protected $fillable = [
        'name',
        'estatus',
    ];

    protected function casts(): array
    {
        return [
            'estatus' => 'boolean',
        ];
    }

    /**
     * Relación: un rol tiene muchos usuarios
     */
    public function users()
    {
        return $this->hasMany(User::class, 'role_id');
    }
}
