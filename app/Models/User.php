<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'status' => 'boolean',
            'role_id' => 'integer',
        ];
    }

    /**
     * Relación: un usuario pertenece a un rol
     */
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    /**
     * Relación: un usuario puede tener un perfil de paciente
     */
    public function patientProfile()
    {
        return $this->hasOne(PatientProfile::class, 'user_id');
    }

    /**
     * Relación: registros de salud del usuario (como paciente)
     */
    public function healthRecords()
    {
        return $this->hasMany(HealthRecord::class, 'patient_id');
    }

    /**
     * Relación: notas clínicas donde el usuario es paciente
     */
    public function clinicalNotesAsPatient()
    {
        return $this->hasMany(ClinicalNote::class, 'patient_id');
    }

    /**
     * Relación: notas clínicas donde el usuario es clínico
     */
    public function clinicalNotesAsClinic()
    {
        return $this->hasMany(ClinicalNote::class, 'clinician_id');
    }

    /**
     * Relación: clínicos asignados a este usuario (como paciente)
     */
    public function clinicians()
    {
        return $this->belongsToMany(User::class, 'patient_clinician', 'patient_id', 'clinician_id')
                    ->withTimestamps();
    }

    /**
     * Relación: pacientes asignados a este usuario (como clínico)
     */
    public function patients()
    {
        return $this->belongsToMany(User::class, 'patient_clinician', 'clinician_id', 'patient_id')
                    ->withTimestamps();
    }
}
