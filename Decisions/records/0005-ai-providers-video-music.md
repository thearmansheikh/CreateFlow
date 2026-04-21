# AI Provider Decisions

## Date
2025-01-07

## Video Generation — MiniMax
**Model:** `MiniMax-Hailuo-2.3` (text-to-video)
**Endpoint:** `POST https://api.minimax.io/v1/video_generation`
**Pattern:** Async — create task → poll `/v1/query/video_generation` until `status: "success"` → retrieve file from `/v1/files/retrieve`
**Cost:** 10 credits per generation
**Why MiniMax:** High-quality video generation with good prompt adherence. Supports durations up to 6 seconds at 768P resolution.

## Music Generation — MiniMax
**Model:** `music-2.6-free`
**Endpoint:** `POST https://api.minimax.io/v1/music_generation`
**Pattern:** Synchronous — returns hex-encoded audio data directly
**Cost:** 5 credits per generation
**Features:** Text-to-music with optional lyrics, instrumental-only mode, 12 genre presets + 8 mood presets

## Retired — Replicate Video
Previously used `kingfischer/kling-1.5` (404'd), then tried `fofr/flow`, `stability-ai/stable-video-diffusion` — all had availability or rate-limit issues on the account. MiniMax provides a more reliable pipeline.

## Future Considerations
- FAL.ai key is placeholder — could be used as secondary video provider
- Suno key is placeholder — MiniMax covers music generation needs
