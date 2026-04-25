#!/bin/bash
set -e
ROOT="/Users/sridharsuresh/Documents/ai-for-bharat/docs/video-output/theme4"
AUDIO="$ROOT/audio"; SLIDES="$ROOT/slides"; OUT="$ROOT/theme4-demo.mp4"; TMP="$ROOT/.tmp"
FFMPEG="/Users/sridharsuresh/Documents/ai-for-bharat/docs/video-output/bin/ffmpeg"
FFPROBE="/Users/sridharsuresh/Documents/ai-for-bharat/docs/video-output/bin/ffprobe"
mkdir -p "$TMP"; rm -f "$TMP"/*.mp4 "$TMP"/concat.txt
for i in 01 02 03 04 05 06 07 08 09; do
  DUR=$("$FFPROBE" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$AUDIO/unit_${i}.aiff")
  echo "  seg $i — ${DUR}s"
  "$FFMPEG" -y -loop 1 -i "$SLIDES/slide_${i}.png" -i "$AUDIO/unit_${i}.aiff" \
    -c:v libx264 -tune stillimage -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -shortest \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=2c0a0a" \
    -t "$DUR" "$TMP/seg_${i}.mp4" -loglevel error
done
> "$TMP/concat.txt"
for i in 01 02 03 04 05 06 07 08 09; do echo "file '$TMP/seg_${i}.mp4'" >> "$TMP/concat.txt"; done
"$FFMPEG" -y -f concat -safe 0 -i "$TMP/concat.txt" -c copy "$OUT" -loglevel error
rm -rf "$TMP"
ls -lh "$OUT"
