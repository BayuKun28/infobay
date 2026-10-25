<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Biodata;
use App\Models\Portfolio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SeoController extends Controller
{
    /**
     * Generate dynamic XML Sitemap for Search Engine Crawlers.
     */
    public function sitemap(Request $request): Response
    {
        $biodata = Biodata::first();
        $portfolios = Portfolio::orderBy('id', 'asc')->get();

        $baseUrl = rtrim(env('APP_CANONICAL_URL', 'https://info.baydev.my.id'), '/');
        $lastmodRoot = $biodata && $biodata->updated_at
            ? $biodata->updated_at->toAtomString()
            : date('Y-m-d\TH:i:sP');

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"' . "\n";
        $xml .= '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' . "\n";
        $xml .= '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' . "\n";
        $xml .= '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">' . "\n";

        // Homepage & Primary Sections
        $sections = [
            ['path' => '', 'priority' => '1.0', 'changefreq' => 'daily'],
            ['path' => '#about', 'priority' => '0.9', 'changefreq' => 'weekly'],
            ['path' => '#portfolio', 'priority' => '0.9', 'changefreq' => 'daily'],
            ['path' => '#services', 'priority' => '0.8', 'changefreq' => 'weekly'],
            ['path' => '#skills', 'priority' => '0.8', 'changefreq' => 'weekly'],
            ['path' => '#experience', 'priority' => '0.8', 'changefreq' => 'weekly'],
            ['path' => '#testimonials', 'priority' => '0.8', 'changefreq' => 'weekly'],
            ['path' => '#certifications', 'priority' => '0.8', 'changefreq' => 'weekly'],
            ['path' => '#contact', 'priority' => '0.7', 'changefreq' => 'monthly'],
        ];

        foreach ($sections as $sec) {
            $loc = htmlspecialchars($baseUrl . '/' . $sec['path']);
            $xml .= "  <url>\n";
            $xml .= "    <loc>{$loc}</loc>\n";
            $xml .= "    <lastmod>{$lastmodRoot}</lastmod>\n";
            $xml .= "    <changefreq>{$sec['changefreq']}</changefreq>\n";
            $xml .= "    <priority>{$sec['priority']}</priority>\n";
            $xml .= "  </url>\n";
        }

        // Dynamic Portfolios Items
        foreach ($portfolios as $item) {
            $itemLastmod = $item->updated_at ? $item->updated_at->toAtomString() : $lastmodRoot;
            $loc = htmlspecialchars($baseUrl . '/#portfolio');
            $xml .= "  <url>\n";
            $xml .= "    <loc>{$loc}</loc>\n";
            $xml .= "    <lastmod>{$itemLastmod}</lastmod>\n";
            $xml .= "    <changefreq>weekly</changefreq>\n";
            $xml .= "    <priority>0.8</priority>\n";
            if (!empty($item->image)) {
                $imgUrl = htmlspecialchars(
                    str_starts_with($item->image, 'http')
                        ? $item->image
                        : $baseUrl . $item->image
                );
                $imgTitle = htmlspecialchars($item->title);
                $xml .= "    <image:image>\n";
                $xml .= "      <image:loc>{$imgUrl}</image:loc>\n";
                $xml .= "      <image:title>{$imgTitle}</image:title>\n";
                $xml .= "    </image:image>\n";
            }
            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200)->header('Content-Type', 'application/xml; charset=utf-8');
    }

    /**
     * Generate robots.txt instruction for web crawlers.
     */
    public function robots(Request $request): Response
    {
        $baseUrl = rtrim(env('APP_CANONICAL_URL', 'https://info.baydev.my.id'), '/');

        $content = "User-agent: *\n";
        $content .= "Allow: /\n";
        $content .= "Disallow: /admin\n";
        $content .= "Disallow: /api/v1/admin\n";
        $content .= "Disallow: /api/v1/auth\n";
        $content .= "\n";
        $content .= "Sitemap: {$baseUrl}/sitemap.xml\n";

        return response($content, 200)->header('Content-Type', 'text/plain; charset=utf-8');
    }

    /**
     * Provide comprehensive SEO metadata & Schema.org JSON-LD for frontend consumption.
     */
    public function seoMeta(Request $request): JsonResponse
    {
        $biodata = Biodata::first();
        $baseUrl = rtrim(env('APP_CANONICAL_URL', 'https://info.baydev.my.id'), '/');

        $keywords = [
            'bayu prastyo',
            'baydev',
            'bayukun',
            'masbay',
            'BayuKun28',
            'baydev.my.id',
            'info.baydev.my.id',
            'bayu prastyo developer',
            'bayu prastyo web programmer',
            'fullstack developer indonesia',
            'laravel 13 specialist',
            'reactjs vite frontend',
            'postgresql expert',
            'neubrutalism web portfolio',
            'rest api architecture',
            'docker homelab debian',
        ];

        $personName = $biodata->name ?? 'Bayu Prastyo';
        $personTitle = $biodata->title ?? 'Full-Stack Web Developer & Solutions Architect';
        $avatarUrl = $biodata->avatar ?? 'https://baydev.my.id/assets/backend/images/about/1757684148.png';
        $aboutText = $biodata->about ?? 'Portofolio resmi Bayu Prastyo (baydev / bayukun / masbay). Senior Full-Stack Web Developer spesialis Laravel, PostgreSQL, React, dan arsitektur sistem performa tinggi.';

        $schemaGraph = [
            '@context' => 'https://schema.org',
            '@graph' => [
                [
                    '@type' => 'Person',
                    '@id' => "{$baseUrl}/#person",
                    'name' => $personName,
                    'alternateName' => ['baydev', 'bayukun', 'masbay', 'BayuKun28', 'namedbay33'],
                    'jobTitle' => $personTitle,
                    'url' => $baseUrl,
                    'image' => $avatarUrl,
                    'description' => $aboutText,
                    'sameAs' => [
                        $biodata->github ?? 'https://github.com/BayuKun28',
                        $biodata->twitter ?? 'https://x.com/namedbay33',
                        $biodata->instagram ?? 'https://www.instagram.com/bayukun_28/',
                        $biodata->facebook ?? 'https://www.facebook.com/bhayou.bluedevil/',
                        'https://baydev.my.id',
                    ],
                    'knowsAbout' => [
                        'PHP', 'Laravel', 'PostgreSQL', 'JavaScript', 'React', 'Tailwind CSS',
                        'Material-UI', 'Docker', 'RESTful API', 'Git', 'Linux Administration'
                    ],
                ],
                [
                    '@type' => 'WebSite',
                    '@id' => "{$baseUrl}/#website",
                    'url' => $baseUrl,
                    'name' => 'Bayu Prastyo (baydev) | Official Portfolio',
                    'alternateName' => 'baydev portfolio',
                    'author' => ['@id' => "{$baseUrl}/#person"],
                    'description' => $aboutText,
                    'inLanguage' => 'id-ID',
                ],
                [
                    '@type' => 'ProfilePage',
                    '@id' => "{$baseUrl}/#profilepage",
                    'url' => $baseUrl,
                    'name' => 'Bayu Prastyo (baydev) - Professional Profile',
                    'isPartOf' => ['@id' => "{$baseUrl}/#website"],
                    'about' => ['@id' => "{$baseUrl}/#person"],
                    'primaryImageOfPage' => $avatarUrl,
                ]
            ]
        ];

        return response()->json([
            'status' => 'success',
            'data' => [
                'title' => 'Bayu Prastyo (baydev) | Senior Full-Stack Web Developer & Solutions Architect',
                'description' => $aboutText,
                'author' => $personName,
                'keywords' => $keywords,
                'keywords_string' => implode(', ', $keywords),
                'canonical' => $baseUrl,
                'base_url' => $baseUrl,
                'sitemap_url' => "{$baseUrl}/sitemap.xml",
                'robots_url' => "{$baseUrl}/robots.txt",
                'open_graph' => [
                    'title' => 'Bayu Prastyo (baydev) | Senior Full-Stack Web Developer',
                    'description' => $aboutText,
                    'url' => $baseUrl,
                    'type' => 'profile',
                    'image' => $avatarUrl,
                    'site_name' => 'Bayu Prastyo (baydev) Portfolio',
                ],
                'twitter_card' => [
                    'card' => 'summary_large_image',
                    'title' => 'Bayu Prastyo (baydev) | Senior Full-Stack Web Developer',
                    'description' => $aboutText,
                    'image' => $avatarUrl,
                    'creator' => '@namedbay33',
                    'site' => '@namedbay33',
                ],
                'socials' => [
                    'github' => $biodata->github ?? 'https://github.com/BayuKun28',
                    'twitter' => $biodata->twitter ?? 'https://x.com/namedbay33',
                    'instagram' => $biodata->instagram ?? 'https://www.instagram.com/bayukun_28/',
                    'facebook' => $biodata->facebook ?? 'https://www.facebook.com/bhayou.bluedevil/',
                ],
                'schema_jsonld' => $schemaGraph,
            ],
        ]);
    }
}
