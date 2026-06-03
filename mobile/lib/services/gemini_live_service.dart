import 'dart:async';
import 'dart:convert';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/foundation.dart';
import 'package:record/record.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import '../config/api_config.dart';
import 'token_storage.dart';

enum LiveConnectionState { idle, connecting, connected, error }

typedef LiveTranscriptCallback = void Function(String role, String text);
typedef LiveErrorCallback = void Function(String message);
typedef LiveStateCallback = void Function(LiveConnectionState state);
typedef LiveTurnCompleteCallback = void Function(String userText, String modelText);

class GeminiLiveService {
  final AudioRecorder _recorder = AudioRecorder();
  final AudioPlayer _player = AudioPlayer();
  WebSocketChannel? _channel;
  StreamSubscription? _audioStreamSub;
  StreamSubscription? _wsSub;
  Timer? _keepAliveTimer;

  LiveConnectionState _state = LiveConnectionState.idle;
  String? _errorMessage;
  String _userTranscript = '';
  String _modelTranscript = '';

  LiveTranscriptCallback? onTranscript;
  LiveTranscriptCallback? onPartialTranscript;
  LiveErrorCallback? onError;
  LiveStateCallback? onStateChange;
  LiveTurnCompleteCallback? onTurnComplete;

  LiveConnectionState get state => _state;
  String? get errorMessage => _errorMessage;
  String get userTranscript => _userTranscript;
  String get modelTranscript => _modelTranscript;

  String get _wsUrl {
    final base = ApiConfig.baseUrl.replaceFirst('https://', 'wss://').replaceFirst('http://', 'ws://');
    final stripped = base.endsWith('/api') ? base.substring(0, base.length - 4) : base;
    return '$stripped/ws/chat/live';
  }

  Future<void> connect({String language = 'en', String voice = 'Zephyr'}) async {
    if (_state == LiveConnectionState.connecting || _state == LiveConnectionState.connected) {
      return;
    }

    _setState(LiveConnectionState.connecting);
    _errorMessage = null;
    _userTranscript = '';
    _modelTranscript = '';

    try {
      final token = await TokenStorage.getToken();
      if (token == null || token.isEmpty) {
        throw Exception('Not authenticated. Please log in first.');
      }

      final uri = Uri.parse(_wsUrl);
      _channel = WebSocketChannel.connect(uri);

      _wsSub = _channel!.stream.listen(
        (data) => _handleMessage(data),
        onError: (error) {
          _handleError(error.toString());
        },
        onDone: () {
          _handleError('Connection closed');
        },
      );

      await _channel!.ready;

      _channel!.sink.add(jsonEncode({'type': 'auth', 'token': token}));

      await _channel!.ready;

      _channel!.sink.add(jsonEncode({
        'type': 'start',
        'language': language,
        'voice': voice,
      }));

      _keepAliveTimer = Timer.periodic(const Duration(seconds: 25), (_) {
        _sendJson({'type': 'ping'});
      });
    } catch (e) {
      _handleError('Failed to connect: $e');
    }
  }

  void _handleMessage(dynamic raw) {
    try {
      final msg = raw is String ? jsonDecode(raw) as Map<String, dynamic> : raw as Map<String, dynamic>;
      final type = msg['type'] as String?;

      switch (type) {
        case 'auth_ok':
          break;
        case 'auth_error':
          _handleError(msg['message'] ?? 'Auth failed');
          break;
        case 'connected':
          _setState(LiveConnectionState.connected);
          _startRecording();
          break;
        case 'transcript':
          _handleTranscript(msg['role'] as String?, msg['text'] as String?);
          break;
        case 'audio':
          _handleAudio(msg['data'] as String?);
          break;
        case 'turn_complete':
          _flushAudio();
          final user = _userTranscript;
          final model = _modelTranscript;
          _userTranscript = '';
          _modelTranscript = '';
          if (user.isNotEmpty || model.isNotEmpty) {
            onTurnComplete?.call(user, model);
          }
          break;
        case 'tool_call':
          debugPrint('[GeminiLive] Tool call: ${msg['name']}(${msg['args']})');
          break;
        case 'error':
          _handleError(msg['message'] ?? 'Server error');
          break;
        case 'closed':
          disconnect();
          break;
        case 'pong':
          break;
      }
    } catch (e) {
      debugPrint('[GeminiLive] Parse error: $e');
    }
  }

  void _handleTranscript(String? role, String? text) {
    if (role == null || text == null || text.isEmpty) return;
    if (role == 'user') {
      _userTranscript = text;
    } else {
      _modelTranscript = text;
    }
    onTranscript?.call(role, text);
  }

  final List<Uint8List> _audioQueue = [];

  void _handleAudio(String? base64Data) {
    if (base64Data == null || base64Data.isEmpty) return;
    try {
      final pcmBytes = base64Decode(base64Data);
      _audioQueue.add(Uint8List.fromList(pcmBytes));
    } catch (e) {
      debugPrint('[GeminiLive] Audio decode error: $e');
    }
  }

  void _flushAudio() {
    if (_audioQueue.isEmpty) return;
    try {
      final allBytes = Uint8List(_audioQueue.fold(0, (sum, chunk) => sum + chunk.length));
      int offset = 0;
      for (final chunk in _audioQueue) {
        allBytes.setRange(offset, offset + chunk.length, chunk);
        offset += chunk.length;
      }
      _audioQueue.clear();

      final wavBytes = _pcmToWav(allBytes, 24000);
      _player.play(BytesSource(wavBytes));
    } catch (e) {
      debugPrint('[GeminiLive] Playback error: $e');
    }
  }

  Uint8List _pcmToWav(Uint8List pcmData, int sampleRate) {
    const numChannels = 1;
    const bitsPerSample = 16;
    final byteRate = sampleRate * numChannels * bitsPerSample ~/ 8;
    final blockAlign = numChannels * bitsPerSample ~/ 8;
    final dataSize = pcmData.length;
    final headerData = ByteData(44);

    headerData.setUint8(0, 0x52);
    headerData.setUint8(1, 0x49);
    headerData.setUint8(2, 0x46);
    headerData.setUint8(3, 0x46);
    headerData.setUint32(4, 36 + dataSize, Endian.little);
    headerData.setUint8(8, 0x57);
    headerData.setUint8(9, 0x41);
    headerData.setUint8(10, 0x56);
    headerData.setUint8(11, 0x45);

    headerData.setUint8(12, 0x66);
    headerData.setUint8(13, 0x6D);
    headerData.setUint8(14, 0x74);
    headerData.setUint8(15, 0x20);
    headerData.setUint32(16, 16, Endian.little);
    headerData.setUint16(20, 1, Endian.little);
    headerData.setUint16(22, numChannels, Endian.little);
    headerData.setUint32(24, sampleRate, Endian.little);
    headerData.setUint32(28, byteRate, Endian.little);
    headerData.setUint16(32, blockAlign, Endian.little);
    headerData.setUint16(34, bitsPerSample, Endian.little);

    headerData.setUint8(36, 0x64);
    headerData.setUint8(37, 0x61);
    headerData.setUint8(38, 0x74);
    headerData.setUint8(39, 0x61);
    headerData.setUint32(40, dataSize, Endian.little);

    final wav = Uint8List(44 + dataSize);
    wav.setRange(0, 44, headerData.buffer.asUint8List());
    wav.setRange(44, 44 + dataSize, pcmData);
    return wav;
  }

  Future<void> _startRecording() async {
    try {
      final hasPermission = await _recorder.hasPermission();
      if (!hasPermission) {
        _handleError('Microphone permission denied');
        return;
      }

      final stream = await _recorder.startStream(
        RecordConfig(
          encoder: AudioEncoder.pcm16bits,
          sampleRate: 16000,
          numChannels: 1,
        ),
      );

      _audioStreamSub = stream.listen(
        (data) {
          if (_channel != null && data.isNotEmpty) {
            final base64 = base64Encode(data);
            _sendJson({'type': 'audio', 'data': base64});
          }
        },
        onError: (error) {
          debugPrint('[GeminiLive] Recording error: $error');
        },
      );
    } catch (e) {
      _handleError('Failed to start recording: $e');
    }
  }

  void _sendJson(Map<String, dynamic> data) {
    try {
      _channel?.sink.add(jsonEncode(data));
    } catch (e) {
      debugPrint('[GeminiLive] Send error: $e');
    }
  }

  void _setState(LiveConnectionState newState) {
    _state = newState;
    onStateChange?.call(newState);
  }

  void _handleError(String message) {
    _errorMessage = message;
    _setState(LiveConnectionState.error);
    onError?.call(message);
    disconnect();
  }

  Future<void> disconnect() async {
    _keepAliveTimer?.cancel();
    _keepAliveTimer = null;

    _sendJson({'type': 'stop'});

    await _audioStreamSub?.cancel();
    _audioStreamSub = null;

    try {
      await _recorder.stop();
    } catch (_) {}

    try {
      await _player.stop();
    } catch (_) {}

    _audioQueue.clear();

    await _wsSub?.cancel();
    _wsSub = null;

    try {
      await _channel?.sink.close();
    } catch (_) {}
    _channel = null;

    _setState(LiveConnectionState.idle);
  }

  void dispose() {
    disconnect();
    _recorder.dispose();
    _player.dispose();
  }
}
