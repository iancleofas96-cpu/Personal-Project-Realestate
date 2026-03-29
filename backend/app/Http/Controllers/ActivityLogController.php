<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ActivityLogController extends Controller
{
    /**
     * Get all activity logs
     */
    public function index(Request $request): JsonResponse
    {
        $query = ActivityLog::with('user')->latest();

        // Filter by module if provided
        if ($request->has('module')) {
            $query->forModule($request->module);
        }

        // Filter by user if provided
        if ($request->has('user_id')) {
            $query->forUser($request->user_id);
        }

        // Filter by date range if provided
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'status' => 'success',
            'data' => $logs,
        ]);
    }

    /**
     * Get recent activities
     */
    public function recent(): JsonResponse
    {
        $logs = ActivityLog::with('user')
            ->recent(10)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $logs,
        ]);
    }

    /**
     * Get activity statistics
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total_logs' => ActivityLog::count(),
            'today_logs' => ActivityLog::whereDate('created_at', today())->count(),
            'this_week_logs' => ActivityLog::whereBetween('created_at', [
                now()->startOfWeek(),
                now()->endOfWeek()
            ])->count(),
            'this_month_logs' => ActivityLog::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
        ];

        // Activity by module
        $stats['by_module'] = ActivityLog::selectRaw('module, COUNT(*) as count')
            ->groupBy('module')
            ->orderBy('count', 'desc')
            ->get();

        // Activity by action
        $stats['by_action'] = ActivityLog::selectRaw('action, COUNT(*) as count')
            ->groupBy('action')
            ->orderBy('count', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $stats,
        ]);
    }
}
