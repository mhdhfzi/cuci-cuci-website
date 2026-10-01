# Compresses every video in public/gallery for the web and exports its poster image.
# Safe to re-run: originals are kept in media-originals/ (git-ignored) and each video is
# re-encoded from its original, so quality never degrades. Needs ffmpeg (winget install Gyan.FFmpeg).
# Usage (from the project folder):  powershell -ExecutionPolicy Bypass -File scripts/compress-videos.ps1

$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')
$root = Split-Path $PSScriptRoot -Parent
$gal  = Join-Path $root "public\gallery"
$bak  = Join-Path $root "media-originals"
New-Item -ItemType Directory -Force $bak | Out-Null

# thumbAt (seconds) per video, read from the gallery data file
$data = Get-Content (Join-Path $root "src\data\gallery.js") -Raw
$thumbs = @{}
foreach ($m in [regex]::Matches($data, 'src: "/gallery/([^"]+\.mp4)"[^}]*?thumbAt: ([\d.]+)')) { $thumbs[$m.Groups[1].Value] = $m.Groups[2].Value }

$before = 0; $after = 0
foreach ($f in Get-ChildItem (Join-Path $gal "*.mp4")) {
  $name = $f.Name
  $orig = Join-Path $bak $name
  if (-not (Test-Path $orig)) { Copy-Item $f.FullName $orig }
  $before += (Get-Item $orig).Length

  $tmp = Join-Path $env:TEMP ("cc_" + $name)
  & ffmpeg -v error -y -i $orig -c:v libx264 -preset slow -crf 30 -maxrate 700k -bufsize 1400k -pix_fmt yuv420p -c:a aac -b:a 80k -movflags +faststart $tmp

  # Keep whichever is smaller
  if ((Get-Item $tmp).Length -lt (Get-Item $orig).Length) { Copy-Item -Force $tmp $f.FullName }
  else { Copy-Item -Force $orig $f.FullName }
  [IO.File]::Delete($tmp)
  $after += (Get-Item $f.FullName).Length

  $t = if ($thumbs.ContainsKey($name)) { $thumbs[$name] } else { "0.5" }
  $poster = [IO.Path]::ChangeExtension($f.FullName, ".jpg")
  & ffmpeg -v error -y -ss $t -i $f.FullName -frames:v 1 -q:v 4 $poster

  "{0,-30} {1,6:N1} MB -> {2,5:N1} MB  poster@{3}s" -f $name, ((Get-Item $orig).Length / 1MB), ((Get-Item $f.FullName).Length / 1MB), $t
}
"TOTAL videos: {0:N1} MB -> {1:N1} MB" -f ($before / 1MB), ($after / 1MB)
