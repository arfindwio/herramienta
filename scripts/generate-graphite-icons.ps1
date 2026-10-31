Add-Type -AssemblyName System.Drawing
$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)
$iconDir = Join-Path $PSScriptRoot "..\icons"

foreach ($s in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($s, $s)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    
    # Background charcoal
    $g.Clear([System.Drawing.ColorTranslator]::FromHtml('#111215'))
    
    # Inner rounded-style container
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#1c1e24'))
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#383b46'), [Math]::Max(2, [int]($s * 0.02)))
    $pad = [int]($s * 0.12)
    $w = $s - ($pad * 2)
    $innerRect = New-Object System.Drawing.Rectangle($pad, $pad, $w, $w)
    $g.FillRectangle($bgBrush, $innerRect)
    $g.DrawRectangle($borderPen, $innerRect)
    
    # Minimalist typography 'TK'
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#f4f4f6'))
    $fontSize = [float]($s * 0.3)
    $font = New-Object System.Drawing.Font('Segoe UI', $fontSize, [System.Drawing.FontStyle]::Bold)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $rectF = New-Object System.Drawing.RectangleF(0, 0, $s, $s)
    $g.DrawString("TK", $font, $textBrush, $rectF, $sf)
    
    $outPath = Join-Path $iconDir "icon-$s.png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}
Write-Host "All graphite PNG icons created successfully!"
