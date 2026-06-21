import asyncio, edge_tts
TEXT = "Credit card ka minimum payment ek trap hai! Maan lo bill hai 30,000 rupaye aur minimum sirf 1,500. Baaki amount par high interest lagta hai. Finplaza ko follow karo!"
async def gen(voice, out):
    c = edge_tts.Communicate(TEXT, voice)
    words = []
    with open(out, "wb") as f:
        async for ch in c.stream():
            if ch["type"] == "audio": f.write(ch["data"])
            elif ch["type"] == "WordBoundary": words.append((ch["text"], round(ch["offset"]/10_000_000, 2)))
    print(voice, "-> words:", len(words), "| first:", words[:6])
async def main():
    await gen("en-IN-PrabhatNeural", "out/edge-prabhat.mp3")
    await gen("hi-IN-MadhurNeural", "out/edge-madhur.mp3")
asyncio.run(main())
