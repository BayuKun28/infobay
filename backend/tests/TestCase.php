<?php

namespace Tests;

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Creates the application.
     *
     * @return \Illuminate\Foundation\Application
     */
    public function createApplication()
    {
        // Enforce isolated test environment variables & bypass cached production configuration
        putenv('APP_ENV=testing');
        $_ENV['APP_ENV'] = 'testing';
        putenv('APP_CONFIG_CACHE=/tmp/infobay_testing_config_cache.php');
        $_ENV['APP_CONFIG_CACHE'] = '/tmp/infobay_testing_config_cache.php';
        putenv('APP_ROUTES_CACHE=/tmp/infobay_testing_routes_cache.php');
        $_ENV['APP_ROUTES_CACHE'] = '/tmp/infobay_testing_routes_cache.php';
        putenv('APP_EVENTS_CACHE=/tmp/infobay_testing_events_cache.php');
        $_ENV['APP_EVENTS_CACHE'] = '/tmp/infobay_testing_events_cache.php';

        $app = require Application::inferBasePath().'/bootstrap/app.php';

        $this->traitsUsedByTest = class_uses_recursive(static::class);

        $app->make(Kernel::class)->bootstrap();

        return $app;
    }
}
