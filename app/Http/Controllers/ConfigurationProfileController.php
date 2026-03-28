<?php
    namespace App\Http\Controllers;
    use Inertia\Inertia;
    use App\Models\User;
    use App\Services\GlucoseService;
    use App\Services\GetChartData;

    class ConfigurationProfileController extends Controller{

    public function index($id){

        $user = User::with(['patientProfile'])->find($id);

        return Inertia::render('ConfigurationProfile', [
           'user'          => $user,
        ]);
     }
    }