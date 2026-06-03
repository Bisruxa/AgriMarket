import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';

import '../../services/api_service.dart';
import '../../services/voice_chat_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_locale_scope.dart';
import 'crop_recommendation.dart';
import 'price_forecast_screen.dart';

/// Persisted Gemini chat via Express `/chat/*`.
class AgriChatScreen extends StatefulWidget {
  final String? defaultRegion;
  final bool showAppBar;

  const AgriChatScreen({
    super.key,
    this.defaultRegion,
    this.showAppBar = true,
  });

  @override
  State<AgriChatScreen> createState() => _AgriChatScreenState();
}

class _AgriChatScreenState extends State<AgriChatScreen> {
  final ApiService _apiService = ApiService();
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final FocusNode _focusNode = FocusNode();

  List<Map<String, dynamic>> _messages = [];
  List<Map<String, dynamic>> _chats = [];
  String? _currentChatId;
  bool _isLoadingChats = true;
  bool _isSending = false;
  final VoiceChatService _voice = VoiceChatService();
  bool _voiceMode = false;
  String _partialVoiceText = '';
  String? _voiceHint;

  @override
  void initState() {
    super.initState();
    _loadChats();
    _voice.initialize();
  }

  @override
  void dispose() {
    _voice.dispose();
    _inputController.dispose();
    _scrollController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  Future<void> _toggleVoiceMode() async {
    if (!_voiceMode) {
      if (!kIsWeb) {
        final mic = await Permission.microphone.request();
        if (!mic.isGranted) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Microphone permission is required for voice mode')),
            );
          }
          return;
        }
      }
    } else {
      await _voice.stopListening();
      await _voice.stopSpeaking();
    }
    setState(() {
      _voiceMode = !_voiceMode;
      _voiceHint = _voiceMode ? 'Tap the mic to speak' : null;
      _partialVoiceText = '';
    });
  }

  Future<void> _toggleVoiceListen() async {
    if (_voice.isListening) {
      await _voice.stopListening();
      setState(() => _voiceHint = 'Tap mic to speak');
      return;
    }

    setState(() {
      _voiceHint = 'Listening…';
      _partialVoiceText = '';
    });

    try {
      await _voice.startListening(
        onPartial: (partial) {
          if (mounted) setState(() => _partialVoiceText = partial);
        },
        onFinal: (text) async {
          if (!mounted) return;
          setState(() {
            _partialVoiceText = '';
            _voiceHint = 'Thinking…';
          });
          await _sendVoiceMessage(text);
        },
      );
    } catch (e) {
      if (mounted) {
        setState(() => _voiceHint = e.toString());
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  Future<void> _sendVoiceMessage(String text) async {
    if (text.trim().isEmpty || _isSending) return;

    if (_currentChatId == null) {
      await _createNewChat();
    }
    if (_currentChatId == null) return;

    setState(() {
      _messages.add({
        'id': 'voice-${DateTime.now().millisecondsSinceEpoch}',
        'role': 'user',
        'content': text.trim(),
        'createdAt': DateTime.now().toIso8601String(),
      });
      _isSending = true;
      _voiceHint = 'AgriAI is responding…';
    });
    _scrollToBottom();

    try {
      final localeService = AppLocaleScope.serviceOf(context);
      final result = await _apiService.sendMessage(_currentChatId!, text.trim(), language: localeService.language.name);
      if (!mounted) return;
      if (result['success'] == true && result['data'] != null) {
        final data = result['data'] as Map<String, dynamic>;
        final assistantMsg = data['assistantMessage'] as Map<String, dynamic>?;
        if (assistantMsg != null) {
          final content = assistantMsg['content']?.toString() ?? '';
          setState(() => _messages.add(assistantMsg));
          _scrollToBottom();
          if (_voiceMode && content.isNotEmpty) {
            await _voice.speak(content);
          }
        }
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _messages.add({
            'id': 'error-voice',
            'role': 'assistant',
            'content': 'Sorry, something went wrong. Please try again.',
            'createdAt': DateTime.now().toIso8601String(),
          });
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSending = false;
          _voiceHint = _voiceMode ? 'Tap the mic to speak' : null;
        });
      }
    }
  }

  Future<void> _loadChats() async {
    setState(() => _isLoadingChats = true);
    final result = await _apiService.getChats();
    if (!mounted) return;
    setState(() {
      _isLoadingChats = false;
      if (result['success'] == true && result['data'] is List) {
        _chats = List<Map<String, dynamic>>.from(result['data']);
      }
    });
  }

  Future<void> _selectChat(String chatId) async {
    setState(() => _currentChatId = chatId);
    final result = await _apiService.getChat(chatId);
    if (!mounted) return;
    if (result['success'] == true && result['data'] != null) {
      final data = result['data'] as Map<String, dynamic>;
      final msgs = data['messages'] as List? ?? [];
      setState(() {
        _messages = msgs.map((m) => Map<String, dynamic>.from(m as Map)).toList();
      });
      _scrollToBottom();
    }
  }

  Future<void> _deleteChat(String chatId) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete chat?'),
        content: const Text('This conversation will be removed permanently.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (ok != true) return;

    final deleted = await _apiService.deleteChat(chatId);
    if (!mounted) return;
    if (deleted) {
      setState(() {
        _chats.removeWhere((c) => c['id'] == chatId);
        if (_currentChatId == chatId) {
          _currentChatId = null;
          _messages = [];
        }
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Chat deleted')),
      );
    }
  }

  Future<void> _createNewChat() async {
    final result = await _apiService.createChat();
    if (!mounted) return;
    if (result['success'] == true && result['data'] != null) {
      final chat = result['data'] as Map<String, dynamic>;
      setState(() {
        _currentChatId = chat['id'];
        _messages = [];
        _chats.insert(0, chat);
      });
    }
  }

  Future<void> _sendMessage() async {
    final text = _inputController.text.trim();
    if (text.isEmpty || _isSending) return;

    _inputController.clear();
    setState(() {
      _messages.add({
        'id': 'temp-${DateTime.now().millisecondsSinceEpoch}',
        'role': 'user',
        'content': text,
        'createdAt': DateTime.now().toIso8601String(),
      });
      _isSending = true;
    });
    _scrollToBottom();

    try {
      var chatId = _currentChatId ?? '';
      if (chatId.isEmpty) {
        final createResult = await _apiService.createChat();
        if (createResult['success'] == true && createResult['data'] != null) {
          chatId = (createResult['data'] as Map<String, dynamic>)['id'];
          setState(() {
            _currentChatId = chatId;
            _chats.insert(0, createResult['data'] as Map<String, dynamic>);
          });
        }
      }

      final localeService = AppLocaleScope.serviceOf(context);
      final result = await _apiService.sendMessage(chatId, text, language: localeService.language.name);
      if (!mounted) return;
      if (result['success'] == true && result['data'] != null) {
        final data = result['data'] as Map<String, dynamic>;
        final assistantMsg = data['assistantMessage'] as Map<String, dynamic>?;
        if (assistantMsg != null) {
          setState(() => _messages.add(assistantMsg));
          _scrollToBottom();
        }
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _messages.add({
            'id': 'error-${DateTime.now().millisecondsSinceEpoch}',
            'role': 'assistant',
            'content': 'Sorry, something went wrong. Please try again.',
            'createdAt': DateTime.now().toIso8601String(),
          });
        });
      }
    } finally {
      if (mounted) setState(() => _isSending = false);
      _scrollToBottom();
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _openToolsMenu() {
    showModalBottomSheet<void>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.eco_rounded, color: AppColors.primary),
              title: const Text('Crop recommendation'),
              onTap: () {
                Navigator.pop(ctx);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const CropRecommendation()),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.trending_up_rounded, color: AppColors.primary),
              title: const Text('Price forecast'),
              onTap: () {
                Navigator.pop(ctx);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => PriceForecastScreen(
                      defaultRegion: widget.defaultRegion,
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final body = Column(
      children: [
        _buildVoiceBar(),
        if (_currentChatId != null) _buildChatHeader(),
        Expanded(
          child: _currentChatId == null ? _buildChatList() : _buildMessages(),
        ),
        if (_currentChatId != null) _buildInputBar(),
      ],
    );

    if (!widget.showAppBar) {
      return ColoredBox(color: AppColors.surface, child: body);
    }

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: const Text('Agri Chat'),
        actions: [
          IconButton(
            icon: Icon(_voiceMode ? Icons.mic_rounded : Icons.mic_none_rounded),
            color: _voiceMode ? AppColors.primary : null,
            onPressed: _toggleVoiceMode,
            tooltip: 'Live voice mode',
          ),
          IconButton(
            icon: const Icon(Icons.tune_rounded),
            onPressed: _openToolsMenu,
            tooltip: 'Tools',
          ),
          IconButton(
            icon: const Icon(Icons.add_comment_rounded),
            onPressed: _createNewChat,
            tooltip: 'New chat',
          ),
        ],
      ),
      body: body,
    );
  }

  Widget _buildVoiceBar() {
    if (!_voiceMode && _voiceHint == null && _partialVoiceText.isEmpty) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 0),
        child: Align(
          alignment: Alignment.centerRight,
          child: TextButton.icon(
            onPressed: _toggleVoiceMode,
            icon: const Icon(Icons.mic_rounded, size: 18),
            label: const Text('Live voice'),
          ),
        ),
      );
    }

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.fromLTRB(12, 8, 12, 0),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: _voice.isListening
            ? AppColors.error.withValues(alpha: 0.08)
            : AppColors.primary.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: _voice.isListening ? AppColors.error : AppColors.primary,
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _voice.isListening
                      ? 'Listening…'
                      : (_voice.isSpeaking ? 'Speaking…' : 'Live voice mode'),
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                    color: AppColors.primary,
                  ),
                ),
                if (_partialVoiceText.isNotEmpty)
                  Text(
                    _partialVoiceText,
                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                  )
                else if (_voiceHint != null)
                  Text(
                    _voiceHint!,
                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                  ),
              ],
            ),
          ),
          IconButton(
            onPressed: _toggleVoiceListen,
            icon: Icon(
              _voice.isListening ? Icons.stop_circle_rounded : Icons.mic_rounded,
              color: _voice.isListening ? AppColors.error : AppColors.primary,
              size: 32,
            ),
          ),
          IconButton(
            onPressed: _toggleVoiceMode,
            icon: const Icon(Icons.close_rounded, size: 20),
            tooltip: 'Exit voice mode',
          ),
        ],
      ),
    );
  }

  Widget _buildChatHeader() {
    final chat = _chats.cast<Map<String, dynamic>?>().firstWhere(
          (c) => c?['id'] == _currentChatId,
          orElse: () => null,
        );
    final title = chat?['title']?.toString() ?? 'Chat';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: AppColors.border)),
      ),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back_rounded, size: 20),
            onPressed: () {
              setState(() {
                _currentChatId = null;
                _messages = [];
              });
              _loadChats();
            },
          ),
          const Icon(Icons.auto_awesome_rounded, size: 18, color: AppColors.primary),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              title,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 14,
                color: AppColors.textPrimary,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          if (_currentChatId != null)
            IconButton(
              icon: const Icon(Icons.delete_outline_rounded, size: 20),
              onPressed: () => _deleteChat(_currentChatId!),
            ),
        ],
      ),
    );
  }

  Widget _buildChatList() {
    if (_isLoadingChats) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      );
    }

    if (_chats.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.auto_awesome_rounded,
                size: 64,
                color: AppColors.primary.withValues(alpha: 0.3),
              ),
              const SizedBox(height: 16),
              const Text(
                'How Can I Help You Today',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Crop recommendations, price forecasts, weather, and market trends',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _createNewChat,
                icon: const Icon(Icons.add_rounded),
                label: const Text('Start a conversation'),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _chats.length,
      separatorBuilder: (_, __) => const Divider(height: 1, color: AppColors.border),
      itemBuilder: (context, index) {
        final chat = _chats[index];
        final id = chat['id']?.toString() ?? '';
        return Dismissible(
          key: ValueKey(id),
          direction: DismissDirection.endToStart,
          background: Container(
            alignment: Alignment.centerRight,
            padding: const EdgeInsets.only(right: 20),
            color: Colors.red.shade400,
            child: const Icon(Icons.delete_rounded, color: Colors.white),
          ),
          confirmDismiss: (_) async {
            await _deleteChat(id);
            return false;
          },
          child: ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.chat_rounded, color: AppColors.primary, size: 20),
            ),
            title: Text(
              chat['title']?.toString() ?? 'Chat',
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
            subtitle: Text(
              _chatPreview(chat),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
            trailing: const Icon(Icons.chevron_right_rounded, size: 20),
            onTap: () => _selectChat(id),
          ),
        );
      },
    );
  }

  String _chatPreview(Map<String, dynamic> chat) {
    final msgs = chat['messages'];
    if (msgs is List && msgs.isNotEmpty) {
      final first = msgs.first;
      if (first is Map) return first['content']?.toString() ?? '';
    }
    return '';
  }

  Widget _buildMessages() {
    if (_messages.isEmpty) {
      return const Center(
        child: Text(
          'How Can I Help You Today',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: AppColors.textSecondary,
          ),
        ),
      );
    }

    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(16),
      itemCount: _messages.length,
      itemBuilder: (context, index) {
        final msg = _messages[index];
        final isUser = msg['role'] == 'user';
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Row(
            mainAxisAlignment:
                isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              if (!isUser) ...[
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.auto_awesome_rounded,
                    size: 16,
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(width: 8),
              ],
              Flexible(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: isUser ? AppColors.primary : Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(18),
                      topRight: const Radius.circular(18),
                      bottomLeft: Radius.circular(isUser ? 18 : 4),
                      bottomRight: Radius.circular(isUser ? 4 : 18),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Text(
                    msg['content']?.toString() ?? '',
                    style: TextStyle(
                      fontSize: 14,
                      color: isUser ? Colors.white : AppColors.textPrimary,
                    ),
                  ),
                ),
              ),
              if (isUser) const SizedBox(width: 8),
              if (isUser)
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.person_rounded, size: 16, color: AppColors.primary),
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildInputBar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 16),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            if (_voiceMode)
              IconButton(
                onPressed: _isSending ? null : _toggleVoiceListen,
                icon: Icon(
                  _voice.isListening ? Icons.stop_circle : Icons.mic_rounded,
                  color: _voice.isListening ? AppColors.error : AppColors.primary,
                ),
              )
            else
              IconButton(
                icon: const Icon(Icons.add_circle_outline_rounded),
                color: AppColors.primary,
                onPressed: _openToolsMenu,
              ),
            Expanded(
              child: TextField(
                controller: _inputController,
                focusNode: _focusNode,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => _sendMessage(),
                decoration: InputDecoration(
                  hintText: 'Ask about crops, prices...',
                  filled: true,
                  fillColor: AppColors.surface,
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Material(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(24),
              child: InkWell(
                borderRadius: BorderRadius.circular(24),
                onTap: _isSending ? null : _sendMessage,
                child: SizedBox(
                  width: 48,
                  height: 48,
                  child: _isSending
                      ? const Padding(
                          padding: EdgeInsets.all(14),
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
