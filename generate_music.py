import numpy as np
import wave
import subprocess
import imageio_ffmpeg

def generate_music(duration=64.0, sample_rate=44100):
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    bpm = 116
    beat_sec = 60.0 / bpm
    
    # 1. Kick drum every beat
    kick = np.zeros_like(t)
    for b in range(int(duration / beat_sec)):
        start = int(b * beat_sec * sample_rate)
        k_len = int(0.18 * sample_rate)
        if start + k_len < len(t):
            k_t = np.linspace(0, 0.18, k_len)
            k_freq = 130 * np.exp(-28 * k_t) + 45
            k_env = np.exp(-14 * k_t)
            kick[start:start+k_len] += 0.40 * np.sin(2 * np.pi * k_freq * k_t) * k_env

    # 2. Hi-hat every eighth note
    hat = np.zeros_like(t)
    for b in range(int(duration / (beat_sec / 2))):
        start = int(b * (beat_sec / 2) * sample_rate)
        h_len = int(0.04 * sample_rate)
        if start + h_len < len(t):
            noise = np.random.uniform(-1, 1, h_len)
            h_env = np.exp(-70 * np.linspace(0, 0.04, h_len))
            hat[start:start+h_len] += 0.10 * noise * h_env

    # 3. Bassline (A - F - C - G)
    bass = np.zeros_like(t)
    notes = [110.0, 87.31, 130.81, 98.0]
    bar_sec = beat_sec * 4
    for bar in range(int(duration / bar_sec) + 1):
        freq = notes[bar % len(notes)]
        start = int(bar * bar_sec * sample_rate)
        end = min(len(t), int((bar + 1) * bar_sec * sample_rate))
        b_t = t[start:end]
        sub = 0.20 * np.sin(2 * np.pi * freq * b_t) + 0.08 * np.sin(2 * np.pi * (freq * 2) * b_t)
        bass[start:end] += sub

    # 4. Melodic Ambient Tech Chords
    chord = np.zeros_like(t)
    chord_freqs = [
        [220, 261.63, 329.63, 440], # Am
        [174.61, 220, 261.63, 349.23], # F
        [261.63, 329.63, 392, 523.25], # C
        [196, 246.94, 293.66, 392]  # G
    ]
    for bar in range(int(duration / bar_sec) + 1):
        c_list = chord_freqs[bar % len(chord_freqs)]
        start = int(bar * bar_sec * sample_rate)
        end = min(len(t), int((bar + 1) * bar_sec * sample_rate))
        c_t = t[start:end]
        c_sig = np.zeros_like(c_t)
        for f in c_list:
            c_sig += 0.045 * np.sin(2 * np.pi * f * c_t)
        env = np.ones_like(c_t)
        att = min(len(env) // 6, int(0.2 * sample_rate))
        env[:att] = np.linspace(0, 1, att)
        env[-att:] = np.linspace(1, 0, att)
        chord[start:end] += c_sig * env

    audio = kick + hat + bass + chord
    fade_len = int(2.0 * sample_rate)
    audio[:fade_len] *= np.linspace(0, 1, fade_len)
    audio[-fade_len:] *= np.linspace(1, 0, fade_len)

    audio = audio / np.max(np.abs(audio) + 1e-6) * 0.32
    audio_int16 = (audio * 32767).astype(np.int16)

    with wave.open("background_music.wav", "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(sample_rate)
        f.writeframes(audio_int16.tobytes())

    print("Background music generated: background_music.wav")

def mix_soundtrack():
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [
        ffmpeg_exe, '-y',
        '-i', 'voiceover_workflow.wav',
        '-i', 'background_music.wav',
        '-filter_complex', '[0:a]volume=1.3[v];[1:a]volume=0.22[m];[v][m]amix=inputs=2:duration=first:dropout_transition=2[a]',
        '-map', '[a]',
        '-c:a', 'aac',
        '-b:a', '192k',
        'final_soundtrack.aac'
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print("Final soundtrack mixed successfully: final_soundtrack.aac")
    else:
        print("Mix error:", res.stderr)

if __name__ == "__main__":
    generate_music(64.0)
    mix_soundtrack()
