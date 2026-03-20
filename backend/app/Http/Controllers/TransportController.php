<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Admission;
use App\Models\TransportRoute;
use App\Models\TransportVehicle;
use App\Models\TransportDriver;
use Carbon\Carbon;

class TransportController extends Controller
{
    public function getStudentBusTracking($admission_no)
    {
        $student = Admission::where('admission_no', $admission_no)
                            ->orWhere('id', $admission_no)
                            ->first();
        if (!$student || !$student->transport_route_id) {
            return response()->json(['error' => 'No transport assigned to this student'], 404);
        }

        $route = TransportRoute::find($student->transport_route_id);
        if (!$route) {
             // Fallback to route_id string match if numeric ID fails
             $route = TransportRoute::where('route_id', $student->transport_route_id)->first();
        }

        if (!$route) {
            return response()->json(['error' => 'Route information not found'], 404);
        }

        $vehicle = null;
        if ($route->assigned_vehicle_id) {
            $vehicle = TransportVehicle::find($route->assigned_vehicle_id);
        } else {
            // Fallback to vehicle_number string from route table
            $vehicle = TransportVehicle::where('registration_no', $route->vehicle_number)
                                       ->orWhere('reg_no', $route->vehicle_number)
                                       ->first();
        }

        $driver = null;
        if ($route->assigned_driver_id) {
            $driver = TransportDriver::find($route->assigned_driver_id);
        } else {
            $driver = TransportDriver::where('name', $route->driver_name)->first();
        }

        return response()->json([
            'success' => true,
            'route'   => $route,
            'vehicle' => $vehicle ? [
                'id' => $vehicle->id,
                'vehicle_id' => $vehicle->vehicle_id,
                'reg_no' => $vehicle->reg_no ?: $vehicle->registration_no,
                'lat' => $vehicle->current_lat,
                'lng' => $vehicle->current_lng,
                'is_tracking' => (bool)$vehicle->is_tracking,
                'last_update' => $vehicle->last_location_update
            ] : null,
            'driver'  => $driver ? [
                'name' => $driver->name,
                'phone' => $driver->phone
            ] : null,
            'eta' => '10 Mins', // Mock for now
            'speed' => '40 km/h' // Mock for now
        ]);
    }

    public function updateLocation(Request $request, $vehicle_id)
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric'
        ]);

        $vehicle = TransportVehicle::where('id', $vehicle_id)
                                   ->orWhere('vehicle_id', $vehicle_id)
                                   ->first();

        if (!$vehicle) {
            return response()->json(['error' => 'Vehicle not found'], 404);
        }

        $vehicle->update([
            'current_lat' => $request->lat,
            'current_lng' => $request->lng,
            'last_location_update' => Carbon::now(),
            'is_tracking' => true
        ]);

        return response()->json(['success' => true]);
    }
}
