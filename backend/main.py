# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from models import Category, Expense
# from database import category_collection, expense_collection

# app = FastAPI()

# # Enable CORS (adjust allow_origins in prod)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ========== CATEGORY ROUTES ==========

# @app.get("/expenses")
# def get_categories():
#     try:
#         categories = list(category_collection.find({}, {"_id": 0}))
#         return categories
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# # @app.post("/categories")
# # def add_category(category: Category):
# #     try:
# #         if category_collection.find_one({"title": category.title}):
# #             raise HTTPException(status_code=400, detail="Category already exists.")
# #         category_collection.insert_one(category.dict())
# #         return {"message": "Category added successfully"}
# #     except Exception as e:
# #         raise HTTPException(status_code=500, detail=str(e))

# # # ========== EXPENSE ROUTES ==========

# # @app.get("/expenses")
# # def get_expenses():
# #     try:
# #         expenses = list(expense_collection.find())
# #         return expenses
# #     except Exception as e:
# #         raise HTTPException(status_code=500, detail=str(e))

# @app.get("/expenses")
# def get_expenses():
#     try:
#         expenses = list(expense_collection.find())
#         print(expenses)
#         for expense in expenses:
#             expense["_id"] = str(expense["_id"])
#         return expenses
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# # @app.post("/expenses")
# # def add_expense(expense: Expense):
# #     try:
# #         expense_collection.insert_one(expense.dict())
# #         return {"message": "Expense added successfully"}
# #     except Exception as e:
# #         raise HTTPException(status_code=500, detail=str(e))


from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
from fastapi import FastAPI, HTTPException, Path

# Initialize app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use exact frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = ""
client = MongoClient(MONGO_URL, tls=True)
db = client["Testing"]
expense_collection = db["expenses"]
category_collection=db["category"]

# Pydantic Model
class Category(BaseModel):
    title: str

class Expense(BaseModel):
    amount: int = Field(..., ge=0)
    date: datetime
    desc: str = Field(..., min_length=3, max_length=50)
    category: Optional[str] = None

# Serialize Mongo ObjectId
def serialize_expense(expense):
    expense["_id"] = str(expense["_id"])
    return expense

# Get all expenses
@app.get("/expenses")
async def get_expenses():
    try:
        expenses = list(expense_collection.find())
        return [serialize_expense(exp) for exp in expenses]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add new expense
@app.post("/expenses")
async def add_expense(expense: Expense):
    try:
        result = expense_collection.insert_one(expense.dict())
        return {"message": "Expense added", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/categories")
async def add_category(category: Category):
    try:
        # Check for duplicates
        if category_collection.find_one({"title": category.title}):
            raise HTTPException(status_code=400, detail="Category already exists.")
        
        result = category_collection.insert_one(category.dict())
        return {"message": "Category added", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# Get all categories
@app.get("/categories")
async def get_categories():
    try:
        categories = list(category_collection.find({}, {"_id": 0}))  # Exclude _id
        return categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/categories/{title}")
async def delete_category(title: str):
    result = category_collection.delete_one({"title": title})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted"}



@app.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str = Path(..., title="The ID of the expense to delete")):
    try:
        result = expense_collection.delete_one({"_id": ObjectId(expense_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Expense not found")
        return {"message": "Expense deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




# ========== PROFILE ROUTES ==========

class Profile(BaseModel):
    name: str
    email: str
    avatar: Optional[str] = None
    totalBudget: Optional[int] = 0

profile_collection = db["profile"]

@app.get("/profile")
async def get_profile():
    profile = profile_collection.find_one({}, {"_id": 0})
    if not profile:
        return {"name": "", "email": "", "avatar": "", "totalBudget": 0}
    return profile

@app.post("/profile")
async def save_profile(profile: Profile):
    try:
        profile_collection.delete_many({})  # Only one profile allowed
        profile_collection.insert_one(profile.dict())
        return {"message": "Profile saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
