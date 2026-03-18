<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Delete existing admin with this email to avoid duplicates
        DB::table('admins')->where('email', 'littleseeds@gmail.com')->delete();

        DB::table('admins')->insert([
            'name'       => 'Little Seeds Admin',
            'email'      => 'littleseeds@gmail.com',
            'password'   => Hash::make('Patna@2026'),
            'role'       => 'super_admin',
            'is_active'  => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->command->info('✅ Admin user created: littleseeds@gmail.com / Patna@2026');
    }
}
