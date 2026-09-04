import psycopg
from psycopg.errors import DuplicateDatabase
import os
from dotenv import load_dotenv

load_dotenv()

# Lấy URL từ biến môi trường, mặc định là postgresql+psycopg://postgres:postgres@localhost:5432/winform_tutor
# Chúng ta cần tách ra để kết nối vào db 'postgres' tạo db mới
db_url = os.getenv("DATABASE_URL", "postgresql+psycopg://postgres:postgres@localhost:5432/winform_tutor")

# Cắt chuỗi để lấy thông tin kết nối cơ bản
# Bỏ 'postgresql+psycopg://'
conn_info = db_url.replace("postgresql+psycopg://", "postgresql://")
# Phân tích chuỗi kết nối
import urllib.parse
parsed = urllib.parse.urlparse(conn_info)

user = parsed.username
password = parsed.password
host = parsed.hostname
port = parsed.port
dbname = parsed.path.lstrip('/')

# Kết nối vào db mặc định 'postgres'
try:
    # Autocommit = True bắt buộc để chạy CREATE DATABASE
    conn = psycopg.connect(
        dbname="postgres",
        user=user,
        password=password,
        host=host,
        port=port,
        autocommit=True
    )
    
    cur = conn.cursor()
    try:
        cur.execute(f"CREATE DATABASE {dbname}")
        print(f"Đã tạo database '{dbname}' thành công!")
    except DuplicateDatabase:
        print(f"Database '{dbname}' đã tồn tại.")
        
    cur.close()
    conn.close()

except Exception as e:
    print(f"Lỗi kết nối hoặc tạo database: {e}")
    print("Vui lòng đảm bảo PostgreSQL đang chạy và thông tin tài khoản là chính xác.")
