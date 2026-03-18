<?php
$dir = __DIR__ . '/app/Models';
$files = scandir($dir);

foreach ($files as $file) {
    if (strpos($file, '.php') !== false) {
        $path = $dir . '/' . $file;
        $content = file_get_contents($path);
        
        if (strpos($content, '$guarded') === false) {
            $pattern = '/use HasFactory;/';
            $replacement = "use HasFactory;\n\n    protected \$guarded = [];";
            $updated = preg_replace($pattern, $replacement, $content);
            file_put_contents($path, $updated);
            echo "Updated $file\n";
        }
    }
}
