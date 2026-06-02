{{flutter_js}}
{{flutter_build_config}}

// Load CanvasKit from the app bundle (not gstatic.com) — required when CDN is blocked.
_flutter.loader.load({
  config: {
    renderer: 'canvaskit',
    canvasKitBaseUrl: 'canvaskit/',
  },
  serviceWorkerSettings: {
    serviceWorkerVersion: {{flutter_service_worker_version}},
  },
});
