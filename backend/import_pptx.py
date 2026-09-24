import os
import asyncio
from pathlib import Path
from knowledge_base import knowledge_base

async def main():
    directory = Path(r"D:\WinformKhongKho\FileTrain\GiaoTrinhCoMuoiPhuong")
    
    # Get all .pptx files in the directory
    pptx_files = list(directory.glob("*.pptx"))
    
    if not pptx_files:
        print(f"No .pptx files found in {directory}")
        return
        
    print(f"Found {len(pptx_files)} .pptx files. Processing...")
    
    for file_path in pptx_files:
        # We know chuong 1, 2, 3 were processed. Let's just process all and the ones already there will be updated or ignored (Chroma handles it, or we just re-embed, but to save quota we can skip 1, 2, 3).
        if "Chuong1" in file_path.name or "Chuong2" in file_path.name or "Chuong3" in file_path.name:
            print(f"Skipping {file_path.name} as it was already processed.")
            continue
            
        print(f"Loading {file_path.name}...")
        
        while True:
            try:
                result = await knowledge_base.add_document(str(file_path), file_path.name)
                if result.get("status") == "success":
                    print(f"Success: Added {result.get('chunks')} chunks from {file_path.name}.")
                else:
                    print(f"Failed to add {file_path.name}: {result.get('message')}")
                break # break the retry loop if successful or failed normally
            except Exception as e:
                if '429' in str(e) or 'RESOURCE_EXHAUSTED' in str(e):
                    print(f"Rate limit hit. Waiting 60 seconds before retrying {file_path.name}...")
                    await asyncio.sleep(60)
                else:
                    print(f"Error processing {file_path.name}: {e}")
                    break
            
    # Print final stats
    stats = knowledge_base.get_stats()
    print("\nKnowledge Base Stats:")
    print(f"Total documents: {stats.get('total_documents')}")
    print(f"Total chunks: {stats.get('total_chunks')}")

if __name__ == "__main__":
    asyncio.run(main())
