<?php

namespace Database\Seeders;

use App\Models\Portfolio;
use App\Models\PortfolioCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PortfolioCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Web Development', 'order_index' => 1],
            ['name' => 'Mobile Development', 'order_index' => 2],
            ['name' => 'UI/UX Design', 'order_index' => 3],
            ['name' => 'Backend System', 'order_index' => 4],
            ['name' => 'DevOps & Homelab', 'order_index' => 5],
            ['name' => 'Multi Platform', 'order_index' => 6],
        ];

        $jsonPath = base_path('../profile_seed_data.json');
        if (\Illuminate\Support\Facades\File::exists($jsonPath)) {
            $data = json_decode(\Illuminate\Support\Facades\File::get($jsonPath), true);
            if (!empty($data['categories'])) {
                $categories = $data['categories'];
            }
        }

        foreach ($categories as $cat) {
            PortfolioCategory::updateOrCreate(
                ['name' => $cat['name']],
                [
                    'slug' => $cat['slug'] ?? Str::slug($cat['name']),
                    'order_index' => $cat['order_index'] ?? 0,
                ]
            );
        }

        // Initialize existing portfolios' order_index if they are 0
        $portfolios = Portfolio::orderBy('id', 'asc')->get();
        $index = 1;
        foreach ($portfolios as $portfolio) {
            if ($portfolio->order_index === 0) {
                $portfolio->order_index = $index;
                $portfolio->save();
            }
            $index++;
        }
    }
}
