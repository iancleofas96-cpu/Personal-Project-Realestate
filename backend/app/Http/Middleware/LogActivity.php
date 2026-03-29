<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\ActivityLog;
use Symfony\Component\HttpFoundation\Response;

class LogActivity
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Don't log GET requests for performance
        if ($request->isMethod('GET')) {
            return $response;
        }

        // Don't log if user is not authenticated
        if (!auth()->check()) {
            return $response;
        }

        // Don't log activity log requests themselves
        if ($request->is('api/activity-logs*')) {
            return $response;
        }

        // Log the activity
        $this->logActivity($request, $response);

        return $response;
    }

    /**
     * Log the activity based on request
     */
    private function logActivity(Request $request, Response $response): void
    {
        $route = $request->route();
        if (!$route) {
            return;
        }

        $action = $this->getActionFromRequest($request, $response);
        $module = $this->getModuleFromRoute($route);
        $recordId = $this->getRecordIdFromRequest($request);
        $description = $this->getDescriptionFromRequest($request, $response);

        ActivityLog::log([
            'action' => $action,
            'module' => $module,
            'record_id' => $recordId,
            'description' => $description,
        ]);
    }

    /**
     * Get action from request method and response
     */
    private function getActionFromRequest(Request $request, Response $response): string
    {
        $method = $request->method();
        $statusCode = $response->getStatusCode();

        // Determine action based on method and status
        if ($method === 'POST' && $statusCode >= 200 && $statusCode < 300) {
            return 'created';
        } elseif ($method === 'PUT' && $statusCode >= 200 && $statusCode < 300) {
            return 'updated';
        } elseif ($method === 'DELETE' && $statusCode >= 200 && $statusCode < 300) {
            return 'deleted';
        } elseif ($statusCode >= 400) {
            return 'error';
        }

        return 'accessed';
    }

    /**
     * Get module from route name
     */
    private function getModuleFromRoute($route): string
    {
        $routeName = $route->getName();
        
        // Map route names to modules
        $moduleMap = [
            'properties.*' => 'properties',
            'clients.*' => 'clients',
            'transactions.*' => 'transactions',
            'appointments.*' => 'appointments',
            'reports.*' => 'reports',
            'users.*' => 'users',
            'auth.*' => 'authentication',
        ];

        foreach ($moduleMap as $pattern => $module) {
            if (preg_match("/$pattern/", $routeName)) {
                return $module;
            }
        }

        return 'system';
    }

    /**
     * Get record ID from request
     */
    private function getRecordIdFromRequest(Request $request): ?int
    {
        // Try to get ID from route parameters
        $id = $request->route('id');
        if ($id) {
            return (int) $id;
        }

        // Try to get ID from request body
        $body = $request->getContent();
        $data = json_decode($body, true);
        if ($data && isset($data['id'])) {
            return (int) $data['id'];
        }

        return null;
    }

    /**
     * Get description from request
     */
    private function getDescriptionFromRequest(Request $request, Response $response): string
    {
        $method = $request->method();
        $uri = $request->getRequestUri();
        $statusCode = $response->getStatusCode();

        $action = $this->getActionFromRequest($request, $response);
        
        // Get resource type from URI
        $resource = $this->getResourceFromUri($uri);

        return ucfirst($action) . ' ' . $resource;
    }

    /**
     * Get resource type from URI
     */
    private function getResourceFromUri(string $uri): string
    {
        $segments = explode('/', trim($uri, '/'));
        
        // Find the first segment that matches a known resource
        $resources = ['properties', 'clients', 'transactions', 'appointments', 'reports', 'users'];
        
        foreach ($segments as $segment) {
            if (in_array($segment, $resources)) {
                return $segment;
            }
        }

        return 'resource';
    }
}
