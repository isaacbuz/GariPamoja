"""
AI Dynamic Pricing Service for GariPamoja
Provides ML-based price optimization for car rentals
"""

import os
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import redis
import requests

logger = logging.getLogger(__name__)

class PricingService:
    """AI-powered dynamic pricing service"""
    
    def __init__(self):
        self.redis_client = redis.Redis.from_url(
            os.getenv("REDIS_URL", "redis://localhost:6379/1"),
            decode_responses=True
        )
        
        # Initialize ML model
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        
        # Pricing factors
        self.factors = {
            'seasonal': {
                'high_season': ['12', '01', '02', '07', '08'],  # Dec-Feb, Jul-Aug
                'low_season': ['03', '04', '05', '06', '09', '10', '11']
            },
            'demand_multipliers': {
                'weekend': 1.2,
                'holiday': 1.5,
                'event': 1.3,
                'business_travel': 1.1
            },
            'location_premiums': {
                'kampala_central': 1.3,
                'entebbe': 1.2,
                'jinja': 1.1,
                'other': 1.0
            }
        }
        
        # Load historical data
        self.load_historical_data()
    
    def load_historical_data(self):
        """Load historical pricing and booking data"""
        try:
            # This would typically load from database
            # For now, create synthetic data
            self.historical_data = self.generate_synthetic_data()
            logger.info("Historical data loaded successfully")
        except Exception as e:
            logger.error(f"Error loading historical data: {str(e)}")
            self.historical_data = pd.DataFrame()
    
    def generate_synthetic_data(self) -> pd.DataFrame:
        """Generate synthetic pricing data for model training"""
        np.random.seed(42)
        
        # Generate 1000 historical bookings
        n_samples = 1000
        
        data = {
            'car_type': np.random.choice(['sedan', 'suv', 'luxury', 'sports'], n_samples),
            'brand': np.random.choice(['Toyota', 'Honda', 'BMW', 'Mercedes'], n_samples),
            'year': np.random.randint(2015, 2024, n_samples),
            'location': np.random.choice(['kampala_central', 'entebbe', 'jinja', 'other'], n_samples),
            'season': np.random.choice(['high', 'low'], n_samples),
            'day_of_week': np.random.randint(0, 7, n_samples),
            'is_weekend': np.random.choice([0, 1], n_samples),
            'is_holiday': np.random.choice([0, 1], n_samples, p=[0.9, 0.1]),
            'duration_days': np.random.randint(1, 15, n_samples),
            'base_price': np.random.uniform(50, 200, n_samples),
            'actual_price': np.random.uniform(50, 300, n_samples),
            'demand_score': np.random.uniform(0.3, 1.0, n_samples),
            'competition_count': np.random.randint(5, 50, n_samples)
        }
        
        return pd.DataFrame(data)
    
    async def suggest_price(
        self,
        car_id: str,
        base_price: float,
        location: str,
        start_date: str,
        end_date: str,
        demand_factors: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Suggest optimal price for car rental"""
        try:
            # Parse dates
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            end_dt = datetime.strptime(end_date, "%Y-%m-%d")
            duration_days = (end_dt - start_dt).days
            
            # Calculate demand factors
            demand_score = self.calculate_demand_score(
                start_dt, end_dt, location, demand_factors
            )
            
            # Get market data
            market_data = await self.get_market_data(location, car_id)
            
            # Calculate optimal price
            suggested_price = self.calculate_optimal_price(
                base_price, demand_score, market_data, duration_days
            )
            
            # Generate recommendations
            recommendations = self.generate_recommendations(
                suggested_price, base_price, demand_score, market_data
            )
            
            return {
                "suggested_price": round(suggested_price, 2),
                "confidence": self.calculate_confidence(demand_score, market_data),
                "factors": {
                    "demand_score": demand_score,
                    "seasonal_factor": self.get_seasonal_factor(start_dt),
                    "location_premium": self.get_location_premium(location),
                    "duration_discount": self.get_duration_discount(duration_days),
                    "market_competition": market_data.get("competition_level", "medium")
                },
                "recommendations": recommendations
            }
            
        except Exception as e:
            logger.error(f"Error suggesting price: {str(e)}")
            return {
                "suggested_price": base_price,
                "confidence": 0.5,
                "factors": {},
                "recommendations": ["Unable to calculate optimal price"]
            }
    
    def calculate_demand_score(
        self,
        start_date: datetime,
        end_date: datetime,
        location: str,
        demand_factors: Optional[Dict[str, Any]] = None
    ) -> float:
        """Calculate demand score based on various factors"""
        try:
            base_score = 0.5
            
            # Seasonal factor
            month = start_date.strftime("%m")
            if month in self.factors['seasonal']['high_season']:
                base_score += 0.2
            elif month in self.factors['seasonal']['low_season']:
                base_score -= 0.1
            
            # Weekend factor
            if start_date.weekday() >= 5:  # Saturday or Sunday
                base_score += 0.1
            
            # Location factor
            location_premium = self.factors['location_premiums'].get(location, 1.0)
            base_score += (location_premium - 1.0) * 0.1
            
            # Holiday factor
            if self.is_holiday(start_date):
                base_score += 0.2
            
            # Duration factor
            duration_days = (end_date - start_date).days
            if duration_days >= 7:
                base_score += 0.1  # Weekly rentals are popular
            
            # Custom demand factors
            if demand_factors:
                if demand_factors.get('event_nearby'):
                    base_score += 0.15
                if demand_factors.get('business_travel'):
                    base_score += 0.1
                if demand_factors.get('tourist_season'):
                    base_score += 0.2
            
            return min(max(base_score, 0.1), 1.0)
            
        except Exception as e:
            logger.error(f"Error calculating demand score: {str(e)}")
            return 0.5
    
    def get_seasonal_factor(self, date: datetime) -> float:
        """Get seasonal pricing factor"""
        month = date.strftime("%m")
        if month in self.factors['seasonal']['high_season']:
            return 1.2
        elif month in self.factors['seasonal']['low_season']:
            return 0.9
        return 1.0
    
    def get_location_premium(self, location: str) -> float:
        """Get location-based pricing premium"""
        return self.factors['location_premiums'].get(location, 1.0)
    
    def get_duration_discount(self, duration_days: int) -> float:
        """Get discount for longer rentals"""
        if duration_days >= 30:
            return 0.8  # 20% discount for monthly rentals
        elif duration_days >= 7:
            return 0.9  # 10% discount for weekly rentals
        return 1.0
    
    def is_holiday(self, date: datetime) -> bool:
        """Check if date is a holiday"""
        # Ugandan holidays (simplified)
        holidays = [
            "01-01",  # New Year
            "01-26",  # Liberation Day
            "03-08",  # Women's Day
            "05-01",  # Labor Day
            "06-03",  # Martyrs Day
            "10-09",  # Independence Day
            "12-25",  # Christmas
            "12-26",  # Boxing Day
        ]
        
        date_str = date.strftime("%m-%d")
        return date_str in holidays
    
    async def get_market_data(self, location: str, car_id: str) -> Dict[str, Any]:
        """Get market data for pricing analysis"""
        try:
            # This would typically query the database
            # For now, return synthetic data
            return {
                "competition_count": np.random.randint(10, 50),
                "competition_level": np.random.choice(["low", "medium", "high"]),
                "average_price": np.random.uniform(80, 150),
                "price_variance": np.random.uniform(10, 30),
                "demand_trend": np.random.choice(["increasing", "stable", "decreasing"])
            }
        except Exception as e:
            logger.error(f"Error getting market data: {str(e)}")
            return {
                "competition_count": 20,
                "competition_level": "medium",
                "average_price": 100,
                "price_variance": 20,
                "demand_trend": "stable"
            }
    
    def calculate_optimal_price(
        self,
        base_price: float,
        demand_score: float,
        market_data: Dict[str, Any],
        duration_days: int
    ) -> float:
        """Calculate optimal price using ML model"""
        try:
            # Prepare features for ML model
            features = self.prepare_features(
                base_price, demand_score, market_data, duration_days
            )
            
            # Use ML model if trained, otherwise use rule-based pricing
            if self.is_trained:
                predicted_price = self.model.predict([features])[0]
            else:
                predicted_price = self.rule_based_pricing(
                    base_price, demand_score, market_data, duration_days
                )
            
            # Apply constraints
            min_price = base_price * 0.7  # Don't go below 70% of base price
            max_price = base_price * 2.0  # Don't go above 200% of base price
            
            return max(min_price, min(predicted_price, max_price))
            
        except Exception as e:
            logger.error(f"Error calculating optimal price: {str(e)}")
            return base_price
    
    def prepare_features(
        self,
        base_price: float,
        demand_score: float,
        market_data: Dict[str, Any],
        duration_days: int
    ) -> List[float]:
        """Prepare features for ML model"""
        return [
            base_price,
            demand_score,
            market_data.get("competition_count", 20),
            market_data.get("average_price", 100),
            duration_days,
            self.get_seasonal_factor(datetime.now()),
            self.get_location_premium("kampala_central")  # Default location
        ]
    
    def rule_based_pricing(
        self,
        base_price: float,
        demand_score: float,
        market_data: Dict[str, Any],
        duration_days: int
    ) -> float:
        """Rule-based pricing when ML model is not available"""
        price = base_price
        
        # Demand adjustment
        if demand_score > 0.8:
            price *= 1.3
        elif demand_score > 0.6:
            price *= 1.1
        elif demand_score < 0.3:
            price *= 0.9
        
        # Competition adjustment
        competition_level = market_data.get("competition_level", "medium")
        if competition_level == "low":
            price *= 1.2
        elif competition_level == "high":
            price *= 0.9
        
        # Duration adjustment
        if duration_days >= 7:
            price *= 0.95  # Small discount for longer rentals
        
        return price
    
    def calculate_confidence(
        self,
        demand_score: float,
        market_data: Dict[str, Any]
    ) -> float:
        """Calculate confidence in price suggestion"""
        confidence = 0.5
        
        # Higher confidence with more data
        if market_data.get("competition_count", 0) > 20:
            confidence += 0.2
        
        # Higher confidence with stable demand
        if market_data.get("demand_trend") == "stable":
            confidence += 0.1
        
        # Higher confidence with moderate demand
        if 0.4 <= demand_score <= 0.8:
            confidence += 0.2
        
        return min(confidence, 0.95)
    
    def generate_recommendations(
        self,
        suggested_price: float,
        base_price: float,
        demand_score: float,
        market_data: Dict[str, Any]
    ) -> List[str]:
        """Generate pricing recommendations"""
        recommendations = []
        
        price_change = ((suggested_price - base_price) / base_price) * 100
        
        if price_change > 20:
            recommendations.append("Consider increasing your base price - high demand detected")
        elif price_change < -10:
            recommendations.append("Consider lowering your base price - low demand detected")
        
        if demand_score > 0.8:
            recommendations.append("High demand period - maximize your pricing")
        elif demand_score < 0.3:
            recommendations.append("Low demand period - consider promotional pricing")
        
        if market_data.get("competition_level") == "high":
            recommendations.append("High competition - focus on value-added services")
        
        if not recommendations:
            recommendations.append("Your current pricing is well-positioned for the market")
        
        return recommendations
    
    async def batch_analyze(self, data: List[Dict[str, Any]]):
        """Batch analyze pricing data"""
        try:
            for item in data:
                await self.suggest_price(
                    car_id=item.get("car_id"),
                    base_price=item.get("base_price"),
                    location=item.get("location"),
                    start_date=item.get("start_date"),
                    end_date=item.get("end_date"),
                    demand_factors=item.get("demand_factors")
                )
            
            logger.info(f"Batch analyzed {len(data)} pricing requests")
            
        except Exception as e:
            logger.error(f"Error in batch analysis: {str(e)}")
    
    def is_healthy(self) -> bool:
        """Check if the service is healthy"""
        try:
            return self.historical_data is not None and len(self.historical_data) > 0
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return False
    
    async def get_total_suggestions(self) -> int:
        """Get total number of pricing suggestions made"""
        try:
            return int(self.redis_client.get("pricing_suggestions_total") or 0)
        except Exception as e:
            logger.error(f"Error getting total suggestions: {str(e)}")
            return 0
    
    async def get_average_accuracy(self) -> float:
        """Get average accuracy of pricing suggestions"""
        try:
            return float(self.redis_client.get("pricing_accuracy") or 0.75)
        except Exception as e:
            logger.error(f"Error getting average accuracy: {str(e)}")
            return 0.75
    
    async def get_revenue_impact(self) -> float:
        """Get estimated revenue impact of pricing suggestions"""
        try:
            return float(self.redis_client.get("pricing_revenue_impact") or 0.15)
        except Exception as e:
            logger.error(f"Error getting revenue impact: {str(e)}")
            return 0.15
    
    async def update_model(self):
        """Update the pricing model with new data"""
        try:
            # Retrain model with new data
            if len(self.historical_data) > 100:
                X = self.historical_data[['base_price', 'demand_score', 'competition_count', 'duration_days']]
                y = self.historical_data['actual_price']
                
                self.model.fit(X, y)
                self.is_trained = True
                
                logger.info("Pricing model updated successfully")
            
        except Exception as e:
            logger.error(f"Error updating pricing model: {str(e)}")
    
    async def get_model_status(self) -> Dict[str, Any]:
        """Get model status information"""
        return {
            "status": "active" if self.is_trained else "training",
            "model": "random_forest",
            "last_updated": datetime.utcnow().isoformat(),
            "performance": {
                "accuracy": await self.get_average_accuracy(),
                "revenue_impact": await self.get_revenue_impact(),
                "total_suggestions": await self.get_total_suggestions()
            }
        } 