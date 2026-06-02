import 'package:flutter/foundation.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:speech_to_text/speech_recognition_result.dart';
import 'package:speech_to_text/speech_to_text.dart';

/// Voice mode: listen → send to chat API → speak assistant reply (mobile-friendly).
class VoiceChatService {
  final SpeechToText _speech = SpeechToText();
  final FlutterTts _tts = FlutterTts();

  bool _initialized = false;
  bool isListening = false;
  bool isSpeaking = false;
  String lastWords = '';

  Future<bool> initialize() async {
    if (_initialized) return true;
    final available = await _speech.initialize(
      onStatus: (status) {
        if (status == 'done' || status == 'notListening') {
          isListening = false;
        }
      },
      onError: (_) {
        isListening = false;
      },
    );
    if (!available) return false;

    await _tts.setLanguage('en-US');
    await _tts.setSpeechRate(0.45);
    await _tts.setVolume(1.0);
    _tts.setCompletionHandler(() {
      isSpeaking = false;
    });
    _initialized = true;
    return true;
  }

  Future<void> startListening({
    required void Function(String text) onFinal,
    void Function(String partial)? onPartial,
  }) async {
    if (!_initialized) {
      final ok = await initialize();
      if (!ok) throw Exception('Speech recognition is not available on this device.');
    }
    if (isListening) return;

    lastWords = '';
    isListening = true;

    await _speech.listen(
      onResult: (SpeechRecognitionResult result) {
        lastWords = result.recognizedWords;
        if (result.finalResult) {
          isListening = false;
          final text = lastWords.trim();
          if (text.isNotEmpty) onFinal(text);
        } else {
          onPartial?.call(lastWords);
        }
      },
      listenFor: const Duration(seconds: 30),
      pauseFor: const Duration(seconds: 2),
      partialResults: true,
      cancelOnError: true,
      listenMode: ListenMode.confirmation,
    );
  }

  Future<void> stopListening() async {
    if (isListening) {
      await _speech.stop();
      isListening = false;
    }
  }

  Future<void> speak(String text) async {
    if (text.trim().isEmpty) return;
    isSpeaking = true;
    if (kIsWeb) {
      // Web TTS works but may need user gesture first.
    }
    await _tts.stop();
    await _tts.speak(text);
  }

  Future<void> stopSpeaking() async {
    await _tts.stop();
    isSpeaking = false;
  }

  void dispose() {
    _speech.stop();
    _tts.stop();
  }
}
