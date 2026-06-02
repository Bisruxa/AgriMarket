import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';

class FarmerChatScreen extends StatefulWidget {
  const FarmerChatScreen({super.key});

  @override
  State<FarmerChatScreen> createState() => _FarmerChatScreenState();
}

class _FarmerChatScreenState extends State<FarmerChatScreen> {
  final ApiService _apiService = ApiService();
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final FocusNode _focusNode = FocusNode();

  List<Map<String, dynamic>> _messages = [];
  List<Map<String, dynamic>> _chats = [];
  String? _currentChatId;
  bool _isLoadingChats = true;
  bool _isSending = false;

  @override
  void initState() {
    super.initState();
    _loadChats();
  }

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  Future<void> _loadChats() async {
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
        _messages = msgs.map((m) => Map<String, dynamic>.from(m)).toList();
      });
      _scrollToBottom();
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
      String chatId = _currentChatId ?? '';
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

      final result = await _apiService.sendMessage(chatId, text);
      if (!mounted) return;
      if (result['success'] == true && result['data'] != null) {
        final data = result['data'] as Map<String, dynamic>;
        final assistantMsg = data['assistantMessage'] as Map<String, dynamic>?;
        if (assistantMsg != null) {
          setState(() {
            _messages.add(assistantMsg);
          });
          _scrollToBottom();
        }
      }
    } catch (e) {
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: const Text('AgriAI Assistant'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_comment_rounded),
            onPressed: _createNewChat,
            tooltip: 'New chat',
          ),
        ],
      ),
      body: Column(
        children: [
          if (_chats.isNotEmpty && _currentChatId != null)
            _buildChatHeader(),
          Expanded(
            child: _currentChatId == null ? _buildChatList() : _buildMessages(),
          ),
          if (_currentChatId != null) _buildInputBar(),
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
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
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
          const SizedBox(width: 8),
          Icon(Icons.auto_awesome_rounded, size: 18, color: AppColors.primary),
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
        ],
      ),
    );
  }

  Widget _buildChatList() {
    if (_isLoadingChats) {
      return const Center(child: CircularProgressIndicator(color: AppColors.primary));
    }

    if (_chats.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.auto_awesome_rounded, size: 64, color: AppColors.primary.withValues(alpha: 0.3)),
            const SizedBox(height: 16),
            const Text(
              'Ask me anything about farming!',
              style: TextStyle(fontSize: 16, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 8),
            const Text(
              'Crop recommendations, price forecasts,\nweather, and market trends',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _createNewChat,
              icon: const Icon(Icons.add_rounded),
              label: const Text('Start a conversation'),
            ),
            const SizedBox(height: 24),
            if (_chats.isNotEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Recent chats',
                        style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    const SizedBox(height: 8),
                    ..._chats.map((chat) => ListTile(
                          leading: const Icon(Icons.chat_rounded, color: AppColors.primary),
                          title: Text(chat['title']?.toString() ?? 'Chat',
                              style: const TextStyle(fontSize: 14)),
                          trailing: const Icon(Icons.chevron_right_rounded),
                          onTap: () => _selectChat(chat['id']),
                        )),
                  ],
                ),
              ),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _chats.length,
      separatorBuilder: (_, __) => const Divider(height: 1, color: AppColors.border),
      itemBuilder: (context, index) {
        final chat = _chats[index];
        return ListTile(
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
            chat['messages'] != null && (chat['messages'] as List).isNotEmpty
                ? (chat['messages'] as List).first['content']?.toString() ?? ''
                : '',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
          ),
          trailing: const Icon(Icons.chevron_right_rounded, size: 20),
          onTap: () => _selectChat(chat['id']),
        );
      },
    );
  }

  Widget _buildMessages() {
    if (_messages.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.auto_awesome_rounded,
                size: 48, color: AppColors.primary.withValues(alpha: 0.3)),
            const SizedBox(height: 12),
            Text(
              'Ask me something\nto get started!',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 15,
                color: AppColors.textSecondary.withValues(alpha: 0.7),
              ),
            ),
          ],
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
            mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              if (!isUser) ...[
                Container(
                  width: 32, height: 32,
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.auto_awesome_rounded,
                      size: 16, color: AppColors.primary),
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
                  width: 32, height: 32,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.person_rounded,
                      size: 16, color: AppColors.primary),
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
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Material(
              color: _inputController.text.trim().isNotEmpty && !_isSending
                  ? AppColors.primary
                  : AppColors.border,
              borderRadius: BorderRadius.circular(24),
              child: InkWell(
                borderRadius: BorderRadius.circular(24),
                onTap: _isSending ? null : _sendMessage,
                child: Container(
                  width: 48, height: 48,
                  alignment: Alignment.center,
                  child: _isSending
                      ? const SizedBox(
                          width: 20, height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.send_rounded,
                          color: Colors.white, size: 20),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
