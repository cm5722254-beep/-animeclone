import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:file_picker/file_picker.dart';
import 'package:http/http.dart' as http;

void main() {
  runApp(const CheatzDabberApp());
}

class CheatzDabberApp extends StatelessWidget {
  const CheatzDabberApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Cheatz Dabber - Khmer Neural Studio',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF070A13),
        primaryColor: const Color(0xFF6366F1),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF6366F1),
          secondary: Color(0xFF06B6D4),
          surface: Color(0xFF0F1629),
        ),
        textTheme: GoogleFonts.kantumruyProTextTheme(
          ThemeData.dark().textTheme,
        ),
      ),
      home: const MainStudioScreen(),
    );
  }
}

class DialogueLine {
  int index;
  double start;
  double end;
  String gender; // 'male' or 'female'
  String text;
  String? audioUrl;

  DialogueLine({
    required this.index,
    required this.start,
    required this.end,
    required this.gender,
    required this.text,
    this.audioUrl,
  });

  Map<String, dynamic> toJson() => {
    'line_index': index,
    'start_time': start,
    'end_time': end,
    'gender': gender,
    'khmer_translation': text,
    'chinese_text': text,
    'speaker_role': gender == 'female' ? 'female_lead' : 'male_lead',
    'audioUrl': audioUrl,
  };
}

class MainStudioScreen extends StatefulWidget {
  const MainStudioScreen({super.key});

  @override
  State<MainStudioScreen> createState() => _MainStudioScreenState();
}

class _MainStudioScreenState extends State<MainStudioScreen> {
  bool inWorkspace = false;
  String serverUrl = "https://animeclone-ai-studio.onrender.com";
  
  File? selectedVideoFile;
  String? uploadedServerFilename;
  String? originalFilename;
  int videoSizeBytes = 0;
  
  List<DialogueLine> dialogueLines = [];
  bool isUploading = false;
  bool isGenerating = false;
  double progressPercent = 0.0;
  String progressMessage = "";
  String? exportedVideoUrl;

  @override
  void initState() {
    super.initState();
    _initDefaultLines();
  }

  void _initDefaultLines() {
    dialogueLines = [
      DialogueLine(
        index: 0,
        start: 0.0,
        end: 3.0,
        gender: 'male',
        text: 'សួស្តីបងប្អូនទាំងអស់គ្នា! ស្វាគមន៍មកកាន់រឿងភាគនេះ។',
      ),
      DialogueLine(
        index: 1,
        start: 3.5,
        end: 6.5,
        gender: 'female',
        text: 'ពិតជាអស្ចារ្យណាស់ ថ្ងៃនេះយើងនឹងទទួលបានបទពិសោធន៍ថ្មី។',
      ),
    ];
  }

  // 1. Pick and Upload Video
  Future<void> _pickVideo() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.video,
      );

      if (result != null && result.files.single.path != null) {
        final file = File(result.files.single.path!);
        setState(() {
          selectedVideoFile = file;
          originalFilename = result.files.single.name;
          videoSizeBytes = file.lengthSync();
          isUploading = true;
          progressMessage = "កំពុង Upload វីដេអូទៅកាន់ម៉ាស៊ីន AI...";
        });

        // Upload to server
        var request = http.MultipartRequest(
          'POST',
          Uri.parse('$serverUrl/api/upload'),
        );
        request.files.add(
          await http.MultipartFile.fromPath('mediaFile', file.path),
        );

        var streamedResponse = await request.send();
        var response = await http.Response.fromStream(streamedResponse);

        if (response.statusCode == 200) {
          final data = jsonDecode(response.body);
          setState(() {
            uploadedServerFilename = data['filename'];
            isUploading = false;
          });
          _showToast("✅ វីដេអូបានផ្ទុកចូលរួចរាល់! កំពុងស្កេនការសន្ទនា...", Colors.green);
          await _scanTimeline(uploadedServerFilename!);
        } else {
          setState(() => isUploading = false);
          _showToast("កំហុស Upload វីដេអូ: HTTP ${response.statusCode}", Colors.red);
        }
      }
    } catch (e) {
      setState(() => isUploading = false);
      _showToast("កំហុស: $e", Colors.red);
    }
  }

  // 2. Auto Scan Dialogue Timeline
  Future<void> _scanTimeline(String filename) async {
    try {
      final res = await http.post(
        Uri.parse('$serverUrl/api/dubbing/scan-timeline'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'filename': filename, 'scope': 'full'}),
      );

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true && data['segments'] != null) {
          List segs = data['segments'];
          if (segs.isNotEmpty) {
            setState(() {
              dialogueLines = segs.asMap().entries.map((entry) {
                int idx = entry.key;
                var s = entry.value;
                return DialogueLine(
                  index: idx,
                  start: (s['start_time'] as num?)?.toDouble() ?? (idx * 3.0),
                  end: (s['end_time'] as num?)?.toDouble() ?? ((idx + 1) * 3.0),
                  gender: s['gender'] ?? (idx % 2 == 0 ? 'male' : 'female'),
                  text: s['khmer_translation'] ?? s['chinese_text'] ?? 'សួស្តី!',
                );
              }).toList();
            });
          }
        }
      }
    } catch (e) {
      debugPrint("Scan notice: $e");
    }
  }

  // 3. Process & Generate Khmer Neural Video
  Future<void> _generateDubbing() async {
    if (uploadedServerFilename == null) {
      _showToast("⚠️ សូមបញ្ចូលវីដេអូជាមុនសិន!", Colors.orange);
      return;
    }

    setState(() {
      isGenerating = true;
      progressPercent = 0.2;
      progressMessage = "កំពុងសំយោគសំឡេងខ្មែរ Neural (Piseth & Sreymom)...";
    });

    try {
      final payload = {
        'filename': uploadedServerFilename,
        'segments': dialogueLines.map((l) => l.toJson()).toList(),
      };

      setState(() {
        progressPercent = 0.5;
        progressMessage = "កំពុងបញ្ចូលសំឡេងខ្មែរជាមួយតន្ត្រីដើម...";
      });

      final res = await http.post(
        Uri.parse('$serverUrl/api/dubbing/assemble-custom'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      );

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true && data['videoUrl'] != null) {
          setState(() {
            isGenerating = false;
            progressPercent = 1.0;
            exportedVideoUrl = "$serverUrl${data['videoUrl']}";
          });
          _showToast("🎉 បញ្ចូលសំឡេងខ្មែររួចរាល់ ១០០%!", Colors.green);
        } else {
          throw Exception(data['error'] ?? 'បរាជ័យ');
        }
      } else {
        throw Exception("Server Error ${res.statusCode}");
      }
    } catch (e) {
      setState(() => isGenerating = false);
      _showToast("កំហុស Generate: $e", Colors.red);
    }
  }

  void _showToast(String msg, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg, style: const TextStyle(color: Colors.white)),
        backgroundColor: color.withOpacity(0.9),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B101D),
        elevation: 0,
        title: Row(
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                gradient: const LinearGradient(
                  colors: [Color(0xFF6366F1), Color(0xFFEC4899)],
                ),
              ),
              child: const Center(
                child: Text('🎬', style: TextStyle(fontSize: 18)),
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Cheatz Dabber',
                  style: GoogleFonts.outfit(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF10B981).withOpacity(0.35)),
                  ),
                  child: const Text(
                    '🇰🇭 Khmer Neural Only',
                    style: TextStyle(fontSize: 9, color: Color(0xFF34D399), fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings, color: Colors.white70),
            onPressed: _showSettingsDialog,
          ),
        ],
      ),
      body: inWorkspace ? _buildWorkspaceView() : _buildSplashView(),
    );
  }

  // View 1: Splash / Launcher
  Widget _buildSplashView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                color: const Color(0xFF0F1629),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.4), width: 2),
                boxShadow: [
                  BoxKey(0xFF6366F1).glow(25),
                ],
              ),
              child: const Center(child: Text('✨', style: TextStyle(fontSize: 40))),
            ),
            const SizedBox(height: 24),
            const Text(
              'ស្ទូឌីយោបញ្ជូលសំឡេងខ្មែរ',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 8),
            const Text(
              'កម្មវិធី Flutter សម្រាប់ Android & iOS\nដំណើរការសំឡេងខ្មែរ Neural ធម្មជាតិឥតគិតថ្លៃ ១០០%',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: Color(0xFF94A3B8), height: 1.5),
            ),
            const SizedBox(height: 36),
            _buildFeatureTile('📁', 'ជ្រើសរើសវីដេអូពីទូរស័ព្ទ (Load Video)'),
            const SizedBox(height: 10),
            _buildFeatureTile('✏️', 'កែសម្រួលពាក្យពេចន៍សន្ទនាតាមចិត្ត'),
            const SizedBox(height: 10),
            _buildFeatureTile('⚡', 'បង្កើតសំឡេងខ្មែរស្វ័យប្រវត្តិ (Generate)'),
            const SizedBox(height: 10),
            _buildFeatureTile('📥', 'ទាញយកវីដេអូកាត់តរួច (Export Video)'),
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6366F1),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(26)),
                  elevation: 6,
                ),
                onPressed: () {
                  setState(() => inWorkspace = true);
                },
                child: const Text(
                  '🚀 ចាប់ផ្ដើមកម្មវិធី (Start App)',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureTile(String emoji, String title) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF0F1629),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Row(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 18)),
          const SizedBox(width: 12),
          Text(title, style: const TextStyle(fontSize: 13, color: Color(0xFFCBD5E1))),
        ],
      ),
    );
  }

  // View 2: Main Workspace
  Widget _buildWorkspaceView() {
    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(14),
            children: [
              // 1. Video Card
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F1629),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.white.withOpacity(0.08)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('🎬 វីដេអូរឿង (Video)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        if (selectedVideoFile != null)
                          TextButton(
                            onPressed: _pickVideo,
                            child: const Text('ប្ដូរវីដេអូ', style: TextStyle(fontSize: 12, color: Color(0xFF818CF8))),
                          ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    if (selectedVideoFile == null)
                      InkWell(
                        onTap: _pickVideo,
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 24),
                          decoration: BoxDecoration(
                            color: const Color(0xFF6366F1).withOpacity(0.08),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.35), style: BorderStyle.solid),
                          ),
                          child: const Column(
                            children: [
                              Text('📁', style: TextStyle(fontSize: 32)),
                              SizedBox(height: 8),
                              Text('ជ្រើសរើសវីដេអូ (Load Video)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                              SizedBox(height: 4),
                              Text('ចុចដើម្បីជ្រើសវីដេអូពីទូរស័ព្ទ (MP4, MKV)', style: TextStyle(fontSize: 11, color: Colors.white54)),
                            ],
                          ),
                        ),
                      )
                    else
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF141C33),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          children: [
                            const Text('🎥', style: TextStyle(fontSize: 24)),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    originalFilename ?? 'video.mp4',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  Text(
                                    "${(videoSizeBytes / (1024 * 1024)).toStringAsFixed(1)} MB",
                                    style: const TextStyle(fontSize: 11, color: Colors.white54),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),

              const SizedBox(height: 14),

              // 2. Editable Dialogue Card
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F1629),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.white.withOpacity(0.08)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('💬 អក្សរការនិយាយ (អាចកែបាន)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.green.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text('Khmer Neural', style: TextStyle(fontSize: 10, color: Colors.greenAccent)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    ...dialogueLines.map((line) => _buildDialogueItem(line)),
                    const SizedBox(height: 10),
                    OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF94A3B8),
                        side: BorderSide(color: Colors.white.withOpacity(0.15)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      onPressed: () {
                        setState(() {
                          double start = dialogueLines.isNotEmpty ? dialogueLines.last.end + 0.5 : 0.0;
                          dialogueLines.add(
                            DialogueLine(
                              index: dialogueLines.length,
                              start: start,
                              end: start + 3.0,
                              gender: dialogueLines.length % 2 == 0 ? 'male' : 'female',
                              text: '',
                            ),
                          );
                        });
                      },
                      icon: const Icon(Icons.add, size: 18),
                      label: const Text('+ បន្ថែមប្រយោគសន្ទនាថ្មី', style: TextStyle(fontSize: 12)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        // 3. Sticky Action Bar
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF0B101D),
            border: Border(top: BorderSide(color: Colors.white.withOpacity(0.08))),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.5), blurRadius: 15, offset: const Offset(0, -3)),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (isGenerating || isUploading) ...[
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(progressMessage, style: const TextStyle(fontSize: 11, color: Color(0xFF38BDF8))),
                    Text("${(progressPercent * 100).toInt()}%", style: const TextStyle(fontSize: 11, color: Color(0xFF38BDF8))),
                  ],
                ),
                const SizedBox(height: 6),
                LinearProgressIndicator(
                  value: progressPercent,
                  backgroundColor: Colors.white10,
                  valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF10B981)),
                  borderRadius: BorderRadius.circular(4),
                ),
                const SizedBox(height: 10),
              ],
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: (isGenerating || isUploading) ? null : _generateDubbing,
                  icon: const Icon(Icons.bolt, color: Colors.white),
                  label: const Text(
                    '⚡ បង្កើតសំឡេងខ្មែរ (Process / Generate)',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ),
              ),
              if (exportedVideoUrl != null) ...[
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0284C7),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () {
                      _showToast("📥 វីដេអូរួចរាល់: $exportedVideoUrl", Colors.blue);
                    },
                    icon: const Icon(Icons.download, color: Colors.white),
                    label: const Text(
                      '📥 ទាញយកវីដេអូ (Export Video)',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDialogueItem(DialogueLine line) {
    bool isFemale = line.gender == 'female';
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFF141C33),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              InkWell(
                onTap: () {
                  setState(() {
                    line.gender = isFemale ? 'male' : 'female';
                  });
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: (isFemale ? Colors.pink : Colors.blue).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: (isFemale ? Colors.pink : Colors.blue).withOpacity(0.3)),
                  ),
                  child: Text(
                    isFemale ? '🌸 [F] ស្រី (Sreymom)' : '👑 [M] ប្រុស (Piseth)',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: isFemale ? Colors.pinkAccent : Colors.blueAccent,
                    ),
                  ),
                ),
              ),
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.play_circle_outline, size: 20, color: Color(0xFF34D399)),
                    onPressed: () {
                      _showToast("▶ កំពុងសាកល្បងសំឡេង...", Colors.teal);
                    },
                    constraints: const BoxConstraints(),
                    padding: const EdgeInsets.symmetric(horizontal: 6),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 18, color: Colors.redAccent),
                    onPressed: () {
                      setState(() => dialogueLines.remove(line));
                    },
                    constraints: const BoxConstraints(),
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 6),
          TextFormField(
            initialValue: line.text,
            maxLines: 2,
            style: const TextStyle(fontSize: 13, color: Colors.white),
            decoration: InputDecoration(
              isDense: true,
              filled: true,
              fillColor: const Color(0xFF0A0E19),
              hintText: 'វាយអក្សរខ្មែរ...',
              hintStyle: const TextStyle(color: Colors.white30),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: Colors.white.withOpacity(0.08)),
              ),
            ),
            onChanged: (val) => line.text = val,
          ),
        ],
      ),
    );
  }

  void _showSettingsDialog() {
    final controller = TextEditingController(text: serverUrl);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF0F1629),
        title: const Text('⚙️ កំណត់ Server Link', style: TextStyle(fontSize: 16)),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            hintText: 'https://...',
            labelText: 'Server URL',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('បោះបង់'),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() => serverUrl = controller.text.trim());
              Navigator.pop(ctx);
              _showToast("✅ បានរក្សាទុក Server: $serverUrl", Colors.green);
            },
            child: const Text('រក្សាទុក'),
          ),
        ],
      ),
    );
  }
}

class BoxKey {
  final int colorHex;
  BoxKey(this.colorHex);

  BoxShadow glow(double radius) => BoxShadow(
    color: Color(colorHex).withOpacity(0.3),
    blurRadius: radius,
    spreadRadius: 2,
  );
}
