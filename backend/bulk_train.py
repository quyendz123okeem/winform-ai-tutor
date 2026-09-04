import os
import asyncio
from pathlib import Path
from knowledge_base import knowledge_base

# Thư mục chứa tài liệu bạn muốn AI học
TRAIN_DATA_DIR = Path("train_data")

async def main():
    print(f"=== CÔNG CỤ NẠP DỮ LIỆU HÀNG LOẠT CHO AI TUTOR ===")
    
    if not TRAIN_DATA_DIR.exists():
        TRAIN_DATA_DIR.mkdir()
        print(f"Đã tạo thư mục '{TRAIN_DATA_DIR.absolute()}'.")
        print("Vui lòng copy các file (PDF, DOCX, TXT, mã nguồn .cs) vào thư mục này rồi chạy lại tool.")
        return

    files = [f for f in TRAIN_DATA_DIR.iterdir() if f.is_file()]
    if not files:
        print(f"Thư mục '{TRAIN_DATA_DIR.absolute()}' đang trống.")
        print("Vui lòng copy tài liệu vào thư mục này rồi chạy lại tool.")
        return

    print(f"Tìm thấy {len(files)} tài liệu. Bắt đầu nạp vào bộ nhớ AI...\n")
    
    for file_path in files:
        print(f"Đang xử lý: {file_path.name} ...")
        try:
            result = await knowledge_base.add_document(str(file_path), file_path.name)
            if result.get("status") == "success":
                print(f" => Thành công! Đã cắt thành {result.get('chunks')} đoạn kiến thức.")
            else:
                print(f" => Thất bại: {result.get('message')}")
        except Exception as e:
            print(f" => Lỗi khi xử lý file {file_path.name}: {str(e)}")
            
    print("\n=== HOÀN TẤT NẠP DỮ LIỆU! ===")
    stats = knowledge_base.get_stats()
    print(f"Tổng số tài liệu trong bộ nhớ: {stats['total_documents']}")
    print(f"Tổng số đoạn kiến thức: {stats['total_chunks']}")

if __name__ == "__main__":
    asyncio.run(main())
