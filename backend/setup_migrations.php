<?php

$dir = __DIR__ . '/database/migrations';
$files = scandir($dir);

$migrations = [
    'create_students_table.php' => "\$table->string('admission_number')->unique();\n\$table->string('name');\n\$table->string('class_name')->nullable();\n\$table->string('section')->nullable();\n\$table->string('parent_name')->nullable();\n\$table->string('contact_number')->nullable();\n\$table->enum('status', ['Active', 'Inactive'])->default('Active');",
    
    'create_employees_table.php' => "\$table->string('employee_id')->unique();\n\$table->string('name');\n\$table->string('designation')->nullable();\n\$table->string('department')->nullable();\n\$table->string('contact_number')->nullable();\n\$table->enum('status', ['Active', 'On Leave'])->default('Active');",
    
    'create_accounts_table.php' => "\$table->string('account_id')->unique();\n\$table->string('parent_name');\n\$table->string('student_ids')->nullable();\n\$table->string('mobile_number')->unique();\n\$table->string('pin');\n\$table->enum('status', ['Active', 'Locked', 'Inactive'])->default('Active');\n\$table->timestamp('last_login')->nullable();",
    
    'create_academic_classes_table.php' => "\$table->string('name');\n\$table->string('section');\n\$table->unsignedBigInteger('class_teacher_id')->nullable();\n\$table->integer('capacity')->default(40);",
    
    'create_subjects_table.php' => "\$table->string('code')->unique();\n\$table->string('name');\n\$table->string('type')->default('Theory');",
    
    'create_exams_table.php' => "\$table->string('name');\n\$table->date('start_date');\n\$table->date('end_date');\n\$table->string('term');\n\$table->enum('status', ['Upcoming', 'Ongoing', 'Completed'])->default('Upcoming');",
    
    'create_exam_results_table.php' => "\$table->foreignId('exam_id');\n\$table->foreignId('student_id');\n\$table->foreignId('subject_id');\n\$table->integer('marks_obtained');\n\$table->integer('max_marks');\n\$table->string('grade')->nullable();\n\$table->text('remarks')->nullable();",
    
    'create_timetables_table.php' => "\$table->foreignId('academic_class_id');\n\$table->string('day');\n\$table->string('period');\n\$table->foreignId('subject_id');\n\$table->foreignId('employee_id');\n\$table->time('start_time');\n\$table->time('end_time');",
    
    'create_transactions_table.php' => "\$table->string('transaction_id')->unique();\n\$table->string('type'); // Income/Expense/Fee\n\$table->string('category'); // e.g., Tuition Fee, Salary, Maintenance\n\$table->decimal('amount', 10, 2);\n\$table->date('date');\n\$table->string('payment_method')->nullable();\n\$table->foreignId('student_id')->nullable();\n\$table->foreignId('employee_id')->nullable();\n\$table->enum('status', ['Completed', 'Pending'])->default('Completed');",
    
    'create_books_table.php' => "\$table->string('book_id')->unique();\n\$table->string('title');\n\$table->string('author');\n\$table->string('category');\n\$table->integer('total_copies')->default(1);\n\$table->integer('available_copies')->default(1);",
    
    'create_transport_routes_table.php' => "\$table->string('route_id')->unique();\n\$table->string('name');\n\$table->string('vehicle_number');\n\$table->string('driver_name')->nullable();\n\$table->string('driver_contact')->nullable();\n\$table->integer('total_stops')->default(0);",
    
    'create_inventory_items_table.php' => "\$table->string('item_id')->unique();\n\$table->string('name');\n\$table->string('category');\n\$table->integer('quantity');\n\$table->string('unit');\n\$table->decimal('unit_price', 10, 2)->nullable();\n\$table->enum('status', ['In Stock', 'Low Stock', 'Out of Stock'])->default('In Stock');",
    
    'create_notices_table.php' => "\$table->string('title');\n\$table->text('content');\n\$table->string('audience')->default('All'); // e.g. Students, Parents, Staff\n\$table->date('valid_until')->nullable();\n\$table->enum('status', ['Active', 'Expired'])->default('Active');",
    
    'create_settings_table.php' => "\$table->string('key')->unique();\n\$table->text('value')->nullable();\n\$table->string('group')->default('general');"
];

foreach ($files as $file) {
    if (strpos($file, '.php') !== false) {
        $found = false;
        $replacement = '';
        foreach ($migrations as $key => $schema) {
            if (strpos($file, $key) !== false) {
                $found = true;
                $replacement = $schema;
                break;
            }
        }
        
        if ($found) {
            $path = $dir . '/' . $file;
            $content = file_get_contents($path);
            $pattern = '/\$table->id\(\);\s*\$table->timestamps\(\);/';
            $new_content = "\$table->id();\n            " . str_replace("\n", "\n            ", $replacement) . "\n            \$table->timestamps();";
            $updated = preg_replace($pattern, $new_content, $content);
            file_put_contents($path, $updated);
            echo "Updated $file\n";
        }
    }
}
