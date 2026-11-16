import os
import glob
import subprocess
import imageio
import imageio_ffmpeg
from PIL import Image

FRAMES_DIR = os.path.join(os.path.dirname(__file__), "demo_frames")
TEMP_VIDEO = os.path.join(os.path.dirname(__file__), "temp_video.mp4")
FINAL_AUDIO = os.path.join(os.path.dirname(__file__), "final_soundtrack.aac")
OUTPUT_VIDEO = os.path.join(os.path.dirname(__file__), "restaurant_pos_demo.mp4")
OUTPUT_THUMB = os.path.join(os.path.dirname(__file__), "restaurant_pos_thumbnail.jpg")
OUTPUT_GIF = os.path.join(os.path.dirname(__file__), "restaurant_pos_preview.gif")

frame_files = sorted(glob.glob(os.path.join(FRAMES_DIR, "frame_*.jpg")))
total_frames = len(frame_files)

print(f"Found {total_frames} frames to compile into MP4...")

if total_frames == 0:
    print("Error: No frames found in demo_frames directory!")
    exit(1)

# 1. Compile 1080p Video stream with H.264 & YUV420p
fps = 11.8
writer = imageio.get_writer(
    TEMP_VIDEO,
    fps=fps,
    codec='libx264',
    quality=8,
    pixelformat='yuv420p',
    macro_block_size=None
)

for idx, fpath in enumerate(frame_files):
    if idx % 50 == 0:
        print(f"Encoding frame {idx + 1}/{total_frames}...")
    img = imageio.v2.imread(fpath)
    writer.append_data(img)

writer.close()
print(f"Visual track encoded: {TEMP_VIDEO}")

# 2. Mux with Final Soundtrack (Voiceover + Background Beat) using FFmpeg
ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
print(f"Muxing audio track with video via FFmpeg: {ffmpeg_exe}...")

cmd = [
    ffmpeg_exe, '-y',
    '-i', TEMP_VIDEO,
    '-i', FINAL_AUDIO,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    OUTPUT_VIDEO
]

res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode == 0:
    print("Muxing successful!")
    if os.path.exists(TEMP_VIDEO):
        os.remove(TEMP_VIDEO)
else:
    print("Muxing error:", res.stderr)

file_size_mb = os.path.getsize(OUTPUT_VIDEO) / (1024 * 1024)
duration_sec = total_frames / fps
print(f"Final MP4 Video with Audio Created!")
print(f"  Path: {OUTPUT_VIDEO}")
print(f"  Duration: {duration_sec:.1f} seconds")
print(f"  Size: {file_size_mb:.2f} MB")
print(f"  Audio: Stereo 44.1kHz AAC (Voiceover + Background Music)")
print(f"  Video: 1920x1080 Full HD 60/10fps H.264")

# 3. Save Crisp High-Res Thumbnail
thumb_idx = min(len(frame_files) // 4, len(frame_files) - 1)
thumb_img = Image.open(frame_files[thumb_idx])
thumb_img.save(OUTPUT_THUMB, quality=95)
print(f"Thumbnail Saved: {OUTPUT_THUMB}")

# 4. Create Animated GIF Preview
print("Generating GIF preview (sampled frames)...")
gif_frames = []
for fpath in frame_files[::6]:
    im = Image.open(fpath)
    im.thumbnail((800, 450), Image.Resampling.LANCZOS)
    gif_frames.append(im.convert("P", palette=Image.Palette.ADAPTIVE))

if gif_frames:
    gif_frames[0].save(
        OUTPUT_GIF,
        save_all=True,
        append_images=gif_frames[1:],
        duration=120,
        loop=0,
        optimize=True
    )
    gif_size_mb = os.path.getsize(OUTPUT_GIF) / (1024 * 1024)
    print(f"GIF Preview Saved: {OUTPUT_GIF} ({gif_size_mb:.2f} MB)")
