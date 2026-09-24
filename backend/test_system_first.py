import asyncio
import os
from database import SessionLocal
from ai_tutor_engine import tutor_engine, QuestionRouter, ResponseCache

async def test():
    print("=== TEST QUESTION ROUTER ===")
    
    test_cases = [
        ("TextBox là gì?", "simple_definition"),
        ("Button Click Event hoạt động như thế nào?", "concept_explanation"),
        ("Đoạn code này bị lỗi NullReferenceException vì sao?", "code_debugging"),
        ("Viết bài thơ tình", "out_of_domain"),
        ("Làm sao để kết nối cơ sở dữ liệu?", "exercise_help")
    ]
    
    for q, expected in test_cases:
        intent = QuestionRouter.route(q)
        print(f"[{'PASS' if intent == expected else 'FAIL'}] '{q}' -> {intent} (Expected: {expected})")
        
    print("\n=== TEST CACHE ===")
    cache = ResponseCache()
    cache.set("TextBox là gì?", {"text": "Là một control", "used_llm": False})
    res = cache.get("TextBox là gì?")
    print(f"Cache retrieval: {res}")
    
    print("\n=== TEST AI_MODE (LOCAL_ONLY) ===")
    os.environ["AI_MODE"] = "LOCAL_ONLY"
    res1 = await tutor_engine.chat("student_A", "TextBox là gì?")
    print(f"Query 1 (TextBox là gì?): used_llm={res1.get('used_llm')}, intent={res1.get('intent')}")
    
    print("\n=== TEST AI_MODE (HYBRID) ===")
    os.environ["AI_MODE"] = "HYBRID"
    res2 = await tutor_engine.chat("student_A", "Tại sao code này lỗi NullReferenceException?")
    print(f"Query 2 (Code lỗi): used_llm={res2.get('used_llm')}, intent={res2.get('intent')}")
    
    print("\n=== TEST CACHE HIT ===")
    res3 = await tutor_engine.chat("student_A", "Tại sao code này lỗi NullReferenceException?")
    print(f"Query 3 (Cache hit): used_llm={res3.get('used_llm')}, intent={res3.get('intent')}")

if __name__ == "__main__":
    asyncio.run(test())
