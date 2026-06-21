import asyncio, edge_tts
async def main():
    c = edge_tts.Communicate("Credit card ka minimum payment ek trap hai. Bill 30000 rupaye.", "en-IN-PrabhatNeural")
    types = {}
    sample = None
    async for ch in c.stream():
        t = ch.get("type"); types[t] = types.get(t,0)+1
        if t and t != "audio" and sample is None: sample = ch
    print("chunk types:", types)
    print("sample meta chunk:", sample)
    print("edge_tts version:", getattr(edge_tts,"__version__","?"))
asyncio.run(main())
