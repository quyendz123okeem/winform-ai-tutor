import os
import asyncio
import time
from pathlib import Path
from knowledge_base import knowledge_base

async def main():
    folder = Path(r'D:\WinformKhongKho\FileTrain')
    
    # Tìm tất cả file .cs, loại bỏ các thư mục rác
    valid_files = []
    for root, dirs, files in os.walk(folder):
        dirs[:] = [d for d in dirs if d not in ('bin', 'obj', 'packages', '.vs')]
        for f in files:
            if f.endswith('.cs') or f.endswith('.pdf') or f.endswith('.docx'):
                valid_files.append(Path(root) / f)
                
    print(f'Found {len(valid_files)} source files to train.')
    
    stats = knowledge_base.get_stats()
    processed = set(stats.get('documents', []))
    print(f"Already processed {len(processed)} files. Skipping them...")

    for f in valid_files:
        if f.name in processed:
            continue
            
        safe_name = f.name.encode("ascii", "replace").decode()
        print(f"Training on {safe_name}...")
        
        while True:
            try:
                res = await knowledge_base.add_document(str(f), f.name)
                if res.get("status") == "success":
                    print(f" -> Success! Added {res.get('chunks')} chunks.")
                    processed.add(f.name)
                else:
                    print(" -> Failed:", res.get("message"))
                break # Thoát vòng lặp while, đi tới file tiếp theo
            except Exception as e:
                err_str = str(e)
                # Nếu chạm quota thì chờ 20 giây rồi thử lại
                if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                    print(" -> Quota hit (429). Sleeping for 20 seconds before retrying...")
                    time.sleep(20)
                else:
                    print(" -> Error:", e)
                    break
            
    print("\n=== HOÀN TẤT NẠP TOÀN BỘ FILE ===")
    print(knowledge_base.get_stats())

if __name__ == "__main__":
    asyncio.run(main())
