<?php
    namespace App\Http\Controllers;
    use Inertia\Inertia;
    use App\Models\User;
    use App\Models\PatientProfile;
    use Illuminate\Http\Request;

    class ConfigurationProfileController extends Controller{

    public function index($id){

        $user = User::with(['patientProfile'])->find($id);
         if (!$user) {
               return redirect()->back()->withErrors(['error' => 'Usuario no encontrado']);
         }

        return Inertia::render('ConfigurationProfile', [
           'user'          => $user,
        ]);
     }

    public function update(Request $request, $id){

        $user = User::with(['patientProfile'])->find($id);

        if (!$user) {
            return redirect()->back()->withErrors(['error' => 'Usuario no encontrado']);
        }

        $validated = $request->validate([
            'glucose_min' => 'required|numeric|min:0',
            'glucose_max' => 'required|numeric|min:0',
            'systolic_max' => 'required|numeric|min:0',
            'diastolic_max' => 'required|numeric|min:0',
            'type_diabetes' => 'required|string',
        ]);

        if ($user->patientProfile) {
            $user->patientProfile->update($validated);
        } else {
            PatientProfile::create(array_merge(['user_id' => $id], $validated));
        }

        return redirect()->back();
    }
    }