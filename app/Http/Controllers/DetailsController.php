<?php
    namespace App\Http\Controllers;
    use Inertia\Inertia;
    use App\Models\User;
    use App\Services\GlucoseService;
    use App\Services\GetChartData;

    class DetailsController extends Controller{

         protected GlucoseService $GlucoseService;
         protected GetChartData $GetChartData;

         public function __construct(GlucoseService $GlucoseService, GetChartData $GetChartData) {
            $this->GlucoseService = $GlucoseService;
            $this->GetChartData = $GetChartData;
         }

         public function index($id){

            $user = User::with(['patientProfile', 'healthRecords'])->find($id);

            if (!$user) {
                abort(404, 'Usuario no encontrado');
            }

            $minGlucose = $user->patientProfile->glucose_min ?? 70;
            $maxGlucose = $user->patientProfile->glucose_max ?? 180;
            $promedioGlucose = ($minGlucose + $maxGlucose) / 2;
            $HbA1cEstimado = $promedioGlucose + 46.7;
            $resultadoEstimado = round($HbA1cEstimado / 28.7, 1);

            $latest = $user->healthRecords()->where('type', 'glucose')->orderBy('recorded_at', 'desc')->first();
            
            $HbA1cLatest = $latest->glucose_value + 46.7;
            $resultado = round($HbA1cLatest / 28.7, 1);
            

            return Inertia::render('PatientMonitoring', [
               'user'          => $user,
               'tirPercentage' => $this->GlucoseService->calculateTir($user),
               'minGlucose'    => $user->patientProfile->glucose_min ?? 70,
               'maxGlucose'    => $user->patientProfile->glucose_max ?? 180,
               'estimatedHbA1c' => $resultadoEstimado,
               'latestHbA1c' => $resultado,
               'chartData30Days'     => $this->GetChartData->getChartData($user, 30),
               'chartData7Days'      => $this->GetChartData->getChartData($user, 7),
            ]);
         }
    }