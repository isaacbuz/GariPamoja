"""
GariPamoja AI Services - FastAPI Application
Provides AI-powered services for the car sharing platform
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
import redis
import json
import logging
from datetime import datetime, timedelta

# Import AI services
from services.chatbot import ChatbotService
from services.pricing import PricingService
from services.fraud_detection import FraudDetectionService
from services.recommendations import RecommendationService
from services.content_moderation import ContentModerationService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="GariPamoja AI Services",
    description="AI-powered services for peer-to-peer car sharing platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Redis connection
redis_client = redis.Redis.from_url(
    os.getenv("REDIS_URL", "redis://localhost:6379/1"),
    decode_responses=True
)

# Initialize AI services
chatbot_service = ChatbotService()
pricing_service = PricingService()
fraud_detection_service = FraudDetectionService()
recommendation_service = RecommendationService()
content_moderation_service = ContentModerationService()

# Pydantic models for request/response
class ChatRequest(BaseModel):
    user_id: str
    message: str
    context: Optional[Dict[str, Any]] = None
    language: str = "en"

class ChatResponse(BaseModel):
    response: str
    confidence: float
    suggested_actions: List[str] = []
    follow_up_questions: List[str] = []

class PricingRequest(BaseModel):
    car_id: str
    base_price: float
    location: str
    start_date: str
    end_date: str
    demand_factors: Optional[Dict[str, Any]] = None

class PricingResponse(BaseModel):
    suggested_price: float
    confidence: float
    factors: Dict[str, Any]
    recommendations: List[str]

class FraudDetectionRequest(BaseModel):
    user_id: str
    transaction_data: Dict[str, Any]
    user_behavior: Optional[Dict[str, Any]] = None

class FraudDetectionResponse(BaseModel):
    risk_score: float
    is_suspicious: bool
    risk_factors: List[str]
    recommendations: List[str]

class RecommendationRequest(BaseModel):
    user_id: str
    preferences: Optional[Dict[str, Any]] = None
    location: Optional[str] = None
    budget: Optional[float] = None
    dates: Optional[Dict[str, str]] = None

class RecommendationResponse(BaseModel):
    recommendations: List[Dict[str, Any]]
    confidence: float
    reasoning: str

class ContentModerationRequest(BaseModel):
    content: str
    content_type: str  # "listing", "message", "review"
    user_id: str

class ContentModerationResponse(BaseModel):
    is_appropriate: bool
    confidence: float
    flagged_issues: List[str]
    suggestions: List[str]

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "chatbot": chatbot_service.is_healthy(),
            "pricing": pricing_service.is_healthy(),
            "fraud_detection": fraud_detection_service.is_healthy(),
            "recommendations": recommendation_service.is_healthy(),
            "content_moderation": content_moderation_service.is_healthy()
        }
    }

# Chatbot endpoint
@app.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """AI-powered chatbot for customer support"""
    try:
        # Check cache first
        cache_key = f"chat:{request.user_id}:{hash(request.message)}"
        cached_response = redis_client.get(cache_key)
        
        if cached_response:
            return JSONResponse(content=json.loads(cached_response))
        
        # Get AI response
        response = await chatbot_service.get_response(
            user_id=request.user_id,
            message=request.message,
            context=request.context,
            language=request.language
        )
        
        # Cache response for 5 minutes
        redis_client.setex(cache_key, 300, json.dumps(response.dict()))
        
        return response
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Dynamic pricing endpoint
@app.post("/pricing/suggest", response_model=PricingResponse)
async def suggest_pricing(request: PricingRequest):
    """AI-powered dynamic pricing suggestions"""
    try:
        response = await pricing_service.suggest_price(
            car_id=request.car_id,
            base_price=request.base_price,
            location=request.location,
            start_date=request.start_date,
            end_date=request.end_date,
            demand_factors=request.demand_factors
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error in pricing endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Fraud detection endpoint
@app.post("/fraud/detect", response_model=FraudDetectionResponse)
async def detect_fraud(request: FraudDetectionRequest):
    """AI-powered fraud detection"""
    try:
        response = await fraud_detection_service.analyze_risk(
            user_id=request.user_id,
            transaction_data=request.transaction_data,
            user_behavior=request.user_behavior
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error in fraud detection endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Recommendations endpoint
@app.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """AI-powered car recommendations"""
    try:
        response = await recommendation_service.get_recommendations(
            user_id=request.user_id,
            preferences=request.preferences,
            location=request.location,
            budget=request.budget,
            dates=request.dates
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error in recommendations endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Content moderation endpoint
@app.post("/moderation/check", response_model=ContentModerationResponse)
async def moderate_content(request: ContentModerationRequest):
    """AI-powered content moderation"""
    try:
        response = await content_moderation_service.check_content(
            content=request.content,
            content_type=request.content_type,
            user_id=request.user_id
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error in content moderation endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Batch processing endpoint
@app.post("/batch/process")
async def batch_process(background_tasks: BackgroundTasks, tasks: List[Dict[str, Any]]):
    """Process multiple AI tasks in background"""
    try:
        task_ids = []
        
        for task in tasks:
            task_id = f"task_{datetime.utcnow().timestamp()}_{len(task_ids)}"
            task_ids.append(task_id)
            
            # Add task to background processing
            background_tasks.add_task(process_background_task, task_id, task)
        
        return {
            "message": "Tasks queued for processing",
            "task_ids": task_ids,
            "status": "queued"
        }
        
    except Exception as e:
        logger.error(f"Error in batch processing: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def process_background_task(task_id: str, task: Dict[str, Any]):
    """Process a background AI task"""
    try:
        task_type = task.get("type")
        
        if task_type == "pricing_analysis":
            await pricing_service.batch_analyze(task.get("data", []))
        elif task_type == "fraud_analysis":
            await fraud_detection_service.batch_analyze(task.get("data", []))
        elif task_type == "content_moderation":
            await content_moderation_service.batch_moderate(task.get("data", []))
        
        # Store result in Redis
        redis_client.setex(f"task_result:{task_id}", 3600, json.dumps({
            "status": "completed",
            "timestamp": datetime.utcnow().isoformat()
        }))
        
    except Exception as e:
        logger.error(f"Error processing background task {task_id}: {str(e)}")
        redis_client.setex(f"task_result:{task_id}", 3600, json.dumps({
            "status": "failed",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }))

# Analytics endpoint
@app.get("/analytics/summary")
async def get_analytics_summary():
    """Get AI service analytics summary"""
    try:
        return {
            "chatbot": {
                "total_conversations": await chatbot_service.get_total_conversations(),
                "average_response_time": await chatbot_service.get_average_response_time(),
                "satisfaction_score": await chatbot_service.get_satisfaction_score()
            },
            "pricing": {
                "total_suggestions": await pricing_service.get_total_suggestions(),
                "average_accuracy": await pricing_service.get_average_accuracy(),
                "revenue_impact": await pricing_service.get_revenue_impact()
            },
            "fraud_detection": {
                "total_analyses": await fraud_detection_service.get_total_analyses(),
                "detection_rate": await fraud_detection_service.get_detection_rate(),
                "false_positive_rate": await fraud_detection_service.get_false_positive_rate()
            },
            "recommendations": {
                "total_recommendations": await recommendation_service.get_total_recommendations(),
                "conversion_rate": await recommendation_service.get_conversion_rate(),
                "average_rating": await recommendation_service.get_average_rating()
            }
        }
        
    except Exception as e:
        logger.error(f"Error in analytics endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Model management endpoints
@app.post("/models/update")
async def update_models():
    """Update AI models with latest data"""
    try:
        # Update all models
        await chatbot_service.update_model()
        await pricing_service.update_model()
        await fraud_detection_service.update_model()
        await recommendation_service.update_model()
        await content_moderation_service.update_model()
        
        return {
            "message": "All models updated successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error updating models: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/models/status")
async def get_model_status():
    """Get status of all AI models"""
    try:
        return {
            "chatbot": await chatbot_service.get_model_status(),
            "pricing": await pricing_service.get_model_status(),
            "fraud_detection": await fraud_detection_service.get_model_status(),
            "recommendations": await recommendation_service.get_model_status(),
            "content_moderation": await content_moderation_service.get_model_status()
        }
        
    except Exception as e:
        logger.error(f"Error getting model status: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    ) 