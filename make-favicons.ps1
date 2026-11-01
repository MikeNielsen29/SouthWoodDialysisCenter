# Generates the raster favicon assets from the same geometry as
# public/media/brand/favicon.svg.
#
# ⛔ WHY A SCRIPT INSTEAD OF HAND-DRAWN SVGs: iOS does not accept SVG for the
#    home-screen icon (it wants apple-touch-icon.png), and browsers that do not
#    read the SVG request /favicon.ico by default. Both are binary, so they
#    cannot live in git as reviewable text — this is the source of truth for
#    the raster versions.
#
# ⚠️ SYSTEM.DRAWING IS WINDOWS-ONLY. On another OS, delete the two .png/.ico
#    outputs and regenerate them with your own tool; the SVGs are the real
#    source of truth and the browser uses those first.

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$outDir = 'D:\Real State Website\public\media\brand'
$brand  = [System.Drawing.Color]::FromArgb(255, 0x0f, 0x5e, 0xa8)   # brand-600
$white  = [System.Drawing.Color]::White

function New-HouseBitmap([int]$size, [bool]$round) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g   = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.Clear([System.Drawing.Color]::Transparent)

  # Background. iOS masks the apple-touch-icon itself, so that one is a full
  # square; the .ico keeps the rounded corners so it matches the SVG.
  if ($round) {
    $r = [int]($size * (14.0 / 64.0))
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $r * 2
    $path.AddArc(0, 0, $d, $d, 180, 90)
    $path.AddArc($size - $d, 0, $d, $d, 270, 90)
    $path.AddArc($size - $d, $size - $d, $d, $d, 0, 90)
    $path.AddArc(0, $size - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    $g.FillPath((New-Object System.Drawing.SolidBrush($brand)), $path)
  } else {
    $g.FillRectangle((New-Object System.Drawing.SolidBrush($brand)), 0, 0, $size, $size)
  }

  # Same outline as the SVG's "M32 13 L53 29 H46.5 V48 H36.5 V36.5 H27.5 V48
  # H17.5 V29 H11 Z", scaled 64 -> $size.
  $s = $size / 64.0
  $pts = @(
    @(32,13), @(53,29), @(46.5,29), @(46.5,48), @(36.5,48), @(36.5,36.5),
    @(27.5,36.5), @(27.5,48), @(17.5,48), @(17.5,29), @(11,29)
  ) | ForEach-Object { New-Object System.Drawing.PointF([float]($_[0]*$s), [float]($_[1]*$s)) }

  $house = New-Object System.Drawing.Drawing2D.GraphicsPath
  $house.AddPolygon([System.Drawing.PointF[]]$pts)
  $g.FillPath((New-Object System.Drawing.SolidBrush($white)), $house)

  # Door punched back out in the brand colour.
  $g.FillRectangle(
    (New-Object System.Drawing.SolidBrush($brand)),
    [float](29.6*$s), [float](36.5*$s), [float](4.8*$s), [float](11.5*$s)
  )

  $g.Dispose()
  return $bmp
}

# --- apple-touch-icon.png (180x180, square: iOS applies its own mask) ---
$apple = New-HouseBitmap 180 $false
$apple.Save("$outDir\apple-touch-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$apple.Dispose()
Write-Output "wrote apple-touch-icon.png"

# --- favicon.ico (32x32 PNG wrapped in an ICO container) ---
$ico = New-HouseBitmap 32 $true
$ms  = New-Object System.IO.MemoryStream
$ico.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$png = $ms.ToArray()
$ico.Dispose()

# ICONDIR + one ICONDIRENTRY + the PNG bytes.
$dir = New-Object System.IO.MemoryStream
$bw  = New-Object System.IO.BinaryWriter($dir)
$bw.Write([UInt16]0)              # reserved
$bw.Write([UInt16]1)              # type: icon
$bw.Write([UInt16]1)              # image count
$bw.Write([Byte]32)               # width
$bw.Write([Byte]32)               # height
$bw.Write([Byte]0)                # palette size
$bw.Write([Byte]0)                # reserved
$bw.Write([UInt16]1)              # colour planes
$bw.Write([UInt16]32)             # bits per pixel
$bw.Write([UInt32]$png.Length)    # bytes in resource
$bw.Write([UInt32]22)             # offset of the image data
$bw.Write($png)
$bw.Flush()

[System.IO.File]::WriteAllBytes("$outDir\favicon.ico", $dir.ToArray())
$bw.Dispose(); $dir.Dispose()
Write-Output ("wrote favicon.ico (" + $png.Length + " bytes of PNG)")