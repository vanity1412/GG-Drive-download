import os
import subprocess
import json
from pathlib import Path
import shutil

def find_ffmpeg_tools():
    """Tìm ffmpeg và ffprobe"""
    ffmpeg = shutil.which('ffmpeg')
    ffprobe = shutil.which('ffprobe')
    
    if not ffmpeg or not ffprobe:
        print("⚠️  Không tìm thấy ffmpeg/ffprobe trong PATH")
        print("Vui lòng cài đặt ffmpeg và thêm vào PATH")
        print("Tải tại: https://ffmpeg.org/download.html")
        return None, None
    
    return ffmpeg, ffprobe

def get_video_duration(file_path, ffprobe_path):
    """Lấy độ dài video/audio bằng ffprobe"""
    try:
        cmd = [
            ffprobe_path,
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'json',
            file_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        data = json.loads(result.stdout)
        return float(data['format']['duration'])
    except subprocess.TimeoutExpired:
        print(f"⏱️  Timeout khi đọc {file_path}")
        return None
    except Exception as e:
        print(f"❌ Lỗi khi đọc {file_path}: {e}")
        return None

def merge_video_audio(video_file, audio_file, output_file, ffmpeg_path):
    """Merge video và audio bằng ffmpeg"""
    cmd = [
        ffmpeg_path,
        '-y',
        '-i', video_file,
        '-i', audio_file,
        '-map', '0:v:0',
        '-map', '1:a:0',
        '-c', 'copy',
        '-shortest',
        output_file
    ]
    
    try:
        subprocess.run(cmd, check=True, capture_output=True)
        print(f"  ✓ Đã merge: {os.path.basename(output_file)}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"  ✗ Lỗi khi merge: {e}")
        return False

def find_and_merge_videos(root_dir='.', name=''):
    """
    Tìm và merge các cặp mp4/m4a có cùng tên file
    Lưu ra thư mục gốc với tên: ETS2024_{name}_{folder}.mp4
    """
    # Tìm ffmpeg tools
    ffmpeg_path, ffprobe_path = find_ffmpeg_tools()
    if not ffmpeg_path or not ffprobe_path:
        return
    
    print(f"✓ Tìm thấy ffmpeg: {ffmpeg_path}")
    print(f"✓ Tìm thấy ffprobe: {ffprobe_path}\n")
    
    merged_count = 0
    
    # Duyệt qua tất cả các thư mục con (bỏ qua thư mục gốc)
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Bỏ qua thư mục gốc
        if dirpath == root_dir or dirpath == '.':
            continue
        
        # Lấy tên folder
        folder_name = os.path.basename(dirpath)
        
        # Lấy danh sách file mp4 và m4a
        mp4_files = [f for f in filenames if f.endswith('.mp4') and not f.startswith('ETS2024')]
        m4a_files = [f for f in filenames if f.endswith('.m4a')]
        
        if not mp4_files or not m4a_files:
            continue
        
        print(f"📁 Thư mục: {folder_name}")
        
        # Tạo dictionary để map tên file (không có extension) với file m4a
        m4a_dict = {}
        for m4a_file in m4a_files:
            base_name = os.path.splitext(m4a_file)[0]
            m4a_dict[base_name] = m4a_file
        
        # Đếm số thứ tự cho mỗi folder
        count = 1
        
        # Kiểm tra từng file mp4
        for mp4_file in mp4_files:
            base_name = os.path.splitext(mp4_file)[0]
            
            # Tìm file m4a có cùng tên
            if base_name in m4a_dict:
                m4a_file = m4a_dict[base_name]
                mp4_path = os.path.join(dirpath, mp4_file)
                m4a_path = os.path.join(dirpath, m4a_file)
                
                print(f"  🎬 {mp4_file}")
                print(f"  🎵 {m4a_file}")
                
                # Tạo tên file output: ETS2024_{name}_{folder}_{count}.mp4
                output_filename = f"ETS2024_{name}_{folder_name}_{count}.mp4"
                output_file = os.path.join(root_dir, output_filename)
                
                print(f"  💾 Output: {output_filename}")
                
                # Merge
                if merge_video_audio(mp4_path, m4a_path, output_file, ffmpeg_path):
                    merged_count += 1
                    count += 1  # Tăng số thứ tự sau khi merge thành công
        
        print()  # Dòng trống giữa các thư mục
    
    return merged_count

if __name__ == "__main__":
    print("🚀 Merge Video/Audio Tool")
    print("=" * 50)
    
    # Nhập tên từ người dùng
    name = input("Nhập tên (name): ").strip()
    
    if not name:
        print("❌ Bạn phải nhập tên!")
        exit(1)
    
    print(f"\n🚀 Bắt đầu merge với tên: {name}\n")
    count = find_and_merge_videos(root_dir='.', name=name)
    if count is not None:
        print(f"✅ Hoàn thành! Đã merge {count} cặp file.")
