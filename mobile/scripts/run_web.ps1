# Run Flutter web with bundled CanvasKit (avoids gstatic.com CDN errors).
Set-Location $PSScriptRoot\..
flutter run -d chrome --no-web-resources-cdn @args
