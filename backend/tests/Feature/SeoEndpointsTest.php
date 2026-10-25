<?php

namespace Tests\Feature;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeoEndpointsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_sitemap_xml_endpoint_returns_valid_xml(): void
    {
        // 1. Web route
        $webRes = $this->get('/sitemap.xml');
        $webRes->assertStatus(200);
        $this->assertStringContainsString('application/xml', $webRes->headers->get('Content-Type'));
        $content = $webRes->getContent();
        $this->assertStringContainsString('<?xml version="1.0" encoding="UTF-8"?>', $content);
        $this->assertStringContainsString('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"', $content);
        $this->assertStringContainsString('<loc>https://info.baydev.my.id/</loc>', $content);
        $this->assertStringContainsString('#portfolio', $content);
        $this->assertStringContainsString('#about', $content);
        $this->assertStringContainsString('</urlset>', $content);

        // 2. API route
        $apiRes = $this->get('/api/v1/sitemap.xml');
        $apiRes->assertStatus(200);
        $this->assertStringContainsString('application/xml', $apiRes->headers->get('Content-Type'));
    }

    public function test_robots_txt_endpoint_returns_text_instructions(): void
    {
        // 1. Web route
        $webRes = $this->get('/robots.txt');
        $webRes->assertStatus(200);
        $this->assertStringContainsString('text/plain', $webRes->headers->get('Content-Type'));
        $content = $webRes->getContent();
        $this->assertStringContainsString('User-agent: *', $content);
        $this->assertStringContainsString('Disallow: /admin', $content);
        $this->assertStringContainsString('Sitemap: https://info.baydev.my.id/sitemap.xml', $content);

        // 2. API route
        $apiRes = $this->get('/api/v1/robots.txt');
        $apiRes->assertStatus(200);
        $this->assertStringContainsString('text/plain', $apiRes->headers->get('Content-Type'));
    }

    public function test_seo_meta_endpoint_returns_rich_keywords_and_schema_jsonld(): void
    {
        $response = $this->getJson('/api/v1/seo-meta');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'data' => [
                    'title',
                    'description',
                    'author',
                    'keywords',
                    'keywords_string',
                    'canonical',
                    'base_url',
                    'sitemap_url',
                    'robots_url',
                    'open_graph' => ['title', 'description', 'url', 'type', 'image', 'site_name'],
                    'twitter_card' => ['card', 'title', 'description', 'image', 'creator', 'site'],
                    'socials',
                    'schema_jsonld' => ['@context', '@graph'],
                ],
            ]);

        $keywords = $response->json('data.keywords');
        $this->assertContains('bayu prastyo', $keywords);
        $this->assertContains('baydev', $keywords);
        $this->assertContains('bayukun', $keywords);
        $this->assertContains('masbay', $keywords);

        $graph = $response->json('data.schema_jsonld.@graph');
        $personNode = collect($graph)->firstWhere('@type', 'Person');
        $this->assertNotNull($personNode);
        $this->assertContains('baydev', $personNode['alternateName']);
        $this->assertContains('masbay', $personNode['alternateName']);
    }
}
