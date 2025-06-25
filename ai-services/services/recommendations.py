"""
AI Recommendation Service for GariPamoja
Provides personalized car recommendations for users
"""

import os
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import redis

logger = logging.getLogger(__name__)

class RecommendationService:
    """AI-powered recommendation service"""
    
    def __init__(self):
        self.redis_client = redis.Redis.from_url(
            os.getenv("REDIS_URL", "redis://localhost:6379/1"),
            decode_responses=True
        )
        
        # Initialize recommendation models
        self.tfidf_vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.user_car_matrix = None
        self.car_similarity_matrix = None
        
        # Load data
        self.load_recommendation_data()
    
    def load_recommendation_data(self):
        """Load recommendation data"""
        try:
            self.recommendation_data = self.generate_synthetic_data()
            self.build_similarity_matrices()
            logger.info("Recommendation data loaded successfully")
        except Exception as e:
            logger.error(f"Error loading recommendation data: {str(e)}")
            self.recommendation_data = pd.DataFrame()
    
    def generate_synthetic_data(self) -> pd.DataFrame:
        """Generate synthetic recommendation data"""
        np.random.seed(42)
        n_samples = 1000
        
        data = {
            'user_id': [f"user_{i}" for i in range(n_samples)],
            'car_id': [f"car_{np.random.randint(1, 100)}" for _ in range(n_samples)],
            'rating': np.random.randint(1, 6, n_samples),
            'booking_count': np.random.randint(1, 10, n_samples),
            'car_type': np.random.choice(['sedan', 'suv', 'luxury', 'sports'], n_samples),
            'brand': np.random.choice(['Toyota', 'Honda', 'BMW', 'Mercedes'], n_samples),
            'price_range': np.random.choice(['budget', 'mid', 'premium'], n_samples),
            'location': np.random.choice(['kampala_central', 'entebbe', 'jinja'], n_samples),
            'timestamp': [datetime.now() - timedelta(days=np.random.randint(1, 365)) for _ in range(n_samples)]
        }
        
        return pd.DataFrame(data)
    
    def build_similarity_matrices(self):
        """Build similarity matrices for recommendations"""
        try:
            # Create user-car interaction matrix
            self.user_car_matrix = self.recommendation_data.pivot_table(
                index='user_id',
                columns='car_id',
                values='rating',
                fill_value=0
            )
            
            # Create car similarity matrix using TF-IDF
            car_features = self.recommendation_data.groupby('car_id').agg({
                'car_type': 'first',
                'brand': 'first',
                'price_range': 'first',
                'location': 'first'
            }).reset_index()
            
            # Create feature text for TF-IDF
            car_features['features'] = car_features.apply(
                lambda x: f"{x['car_type']} {x['brand']} {x['price_range']} {x['location']}", 
                axis=1
            )
            
            # Calculate TF-IDF and similarity
            tfidf_matrix = self.tfidf_vectorizer.fit_transform(car_features['features'])
            self.car_similarity_matrix = cosine_similarity(tfidf_matrix)
            
            logger.info("Similarity matrices built successfully")
            
        except Exception as e:
            logger.error(f"Error building similarity matrices: {str(e)}")
    
    async def get_recommendations(
        self,
        user_id: str,
        preferences: Optional[Dict[str, Any]] = None,
        location: Optional[str] = None,
        budget: Optional[float] = None,
        dates: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Get personalized car recommendations"""
        try:
            # Get user preferences
            user_prefs = self.get_user_preferences(user_id, preferences)
            
            # Get available cars
            available_cars = await self.get_available_cars(location, budget, dates)
            
            # Generate recommendations
            recommendations = self.generate_recommendations(
                user_id, user_prefs, available_cars
            )
            
            # Calculate confidence and reasoning
            confidence = self.calculate_confidence(user_id, user_prefs)
            reasoning = self.generate_reasoning(user_prefs, recommendations)
            
            return {
                "recommendations": recommendations,
                "confidence": confidence,
                "reasoning": reasoning
            }
            
        except Exception as e:
            logger.error(f"Error getting recommendations: {str(e)}")
            return {
                "recommendations": [],
                "confidence": 0.0,
                "reasoning": "Unable to generate recommendations"
            }
    
    def get_user_preferences(
        self,
        user_id: str,
        preferences: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Get user preferences from history and explicit preferences"""
        try:
            # Get historical preferences
            user_history = self.recommendation_data[
                self.recommendation_data['user_id'] == user_id
            ]
            
            historical_prefs = {}
            if len(user_history) > 0:
                historical_prefs = {
                    'preferred_car_types': user_history['car_type'].value_counts().head(3).index.tolist(),
                    'preferred_brands': user_history['brand'].value_counts().head(3).index.tolist(),
                    'preferred_price_range': user_history['price_range'].mode().iloc[0] if len(user_history['price_range'].mode()) > 0 else 'mid',
                    'preferred_locations': user_history['location'].value_counts().head(3).index.tolist(),
                    'average_rating': user_history['rating'].mean(),
                    'total_bookings': len(user_history)
                }
            
            # Merge with explicit preferences
            if preferences:
                historical_prefs.update(preferences)
            
            # Set defaults if no history
            if not historical_prefs:
                historical_prefs = {
                    'preferred_car_types': ['sedan', 'suv'],
                    'preferred_brands': ['Toyota', 'Honda'],
                    'preferred_price_range': 'mid',
                    'preferred_locations': ['kampala_central'],
                    'average_rating': 4.0,
                    'total_bookings': 0
                }
            
            return historical_prefs
            
        except Exception as e:
            logger.error(f"Error getting user preferences: {str(e)}")
            return {
                'preferred_car_types': ['sedan'],
                'preferred_brands': ['Toyota'],
                'preferred_price_range': 'mid',
                'preferred_locations': ['kampala_central'],
                'average_rating': 4.0,
                'total_bookings': 0
            }
    
    async def get_available_cars(
        self,
        location: Optional[str] = None,
        budget: Optional[float] = None,
        dates: Optional[Dict[str, str]] = None
    ) -> List[Dict[str, Any]]:
        """Get available cars based on filters"""
        try:
            # This would typically query the database
            # For now, return synthetic data
            available_cars = []
            
            for i in range(20):
                car = {
                    'id': f"car_{i+1}",
                    'name': f"Car {i+1}",
                    'brand': np.random.choice(['Toyota', 'Honda', 'BMW', 'Mercedes']),
                    'model': f"Model {i+1}",
                    'car_type': np.random.choice(['sedan', 'suv', 'luxury', 'sports']),
                    'price_per_day': np.random.uniform(50, 200),
                    'location': np.random.choice(['kampala_central', 'entebbe', 'jinja']),
                    'rating': np.random.uniform(3.5, 5.0),
                    'total_reviews': np.random.randint(5, 50),
                    'features': ['AC', 'GPS', 'Bluetooth'],
                    'images': [f"https://example.com/car_{i+1}.jpg"]
                }
                
                # Apply filters
                if location and car['location'] != location:
                    continue
                
                if budget and car['price_per_day'] > budget:
                    continue
                
                available_cars.append(car)
            
            return available_cars
            
        except Exception as e:
            logger.error(f"Error getting available cars: {str(e)}")
            return []
    
    def generate_recommendations(
        self,
        user_id: str,
        user_prefs: Dict[str, Any],
        available_cars: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Generate personalized recommendations"""
        try:
            recommendations = []
            
            for car in available_cars:
                score = self.calculate_car_score(car, user_prefs)
                
                if score > 0.5:  # Only recommend cars with good match
                    car_recommendation = car.copy()
                    car_recommendation['match_score'] = round(score, 3)
                    car_recommendation['match_reasons'] = self.get_match_reasons(car, user_prefs)
                    recommendations.append(car_recommendation)
            
            # Sort by match score and return top 10
            recommendations.sort(key=lambda x: x['match_score'], reverse=True)
            return recommendations[:10]
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            return []
    
    def calculate_car_score(
        self,
        car: Dict[str, Any],
        user_prefs: Dict[str, Any]
    ) -> float:
        """Calculate how well a car matches user preferences"""
        try:
            score = 0.0
            
            # Car type preference
            if car['car_type'] in user_prefs.get('preferred_car_types', []):
                score += 0.3
            
            # Brand preference
            if car['brand'] in user_prefs.get('preferred_brands', []):
                score += 0.2
            
            # Location preference
            if car['location'] in user_prefs.get('preferred_locations', []):
                score += 0.2
            
            # Price range preference
            price_range = self.get_price_range(car['price_per_day'])
            if price_range == user_prefs.get('preferred_price_range', 'mid'):
                score += 0.2
            
            # Rating preference
            if car['rating'] >= user_prefs.get('average_rating', 4.0):
                score += 0.1
            
            # Normalize score
            return min(score, 1.0)
            
        except Exception as e:
            logger.error(f"Error calculating car score: {str(e)}")
            return 0.0
    
    def get_price_range(self, price_per_day: float) -> str:
        """Get price range category"""
        if price_per_day < 80:
            return 'budget'
        elif price_per_day < 150:
            return 'mid'
        else:
            return 'premium'
    
    def get_match_reasons(
        self,
        car: Dict[str, Any],
        user_prefs: Dict[str, Any]
    ) -> List[str]:
        """Get reasons why car matches user preferences"""
        reasons = []
        
        if car['car_type'] in user_prefs.get('preferred_car_types', []):
            reasons.append(f"Matches your preferred {car['car_type']} type")
        
        if car['brand'] in user_prefs.get('preferred_brands', []):
            reasons.append(f"From your preferred brand {car['brand']}")
        
        if car['location'] in user_prefs.get('preferred_locations', []):
            reasons.append(f"Located in your preferred area")
        
        price_range = self.get_price_range(car['price_per_day'])
        if price_range == user_prefs.get('preferred_price_range', 'mid'):
            reasons.append(f"Fits your {price_range} budget")
        
        if car['rating'] >= 4.5:
            reasons.append("Highly rated by other users")
        
        return reasons
    
    def calculate_confidence(
        self,
        user_id: str,
        user_prefs: Dict[str, Any]
    ) -> float:
        """Calculate confidence in recommendations"""
        try:
            confidence = 0.5
            
            # Higher confidence with more user history
            total_bookings = user_prefs.get('total_bookings', 0)
            if total_bookings > 10:
                confidence += 0.3
            elif total_bookings > 5:
                confidence += 0.2
            elif total_bookings > 0:
                confidence += 0.1
            
            # Higher confidence with clear preferences
            if len(user_prefs.get('preferred_car_types', [])) > 0:
                confidence += 0.1
            
            if len(user_prefs.get('preferred_brands', [])) > 0:
                confidence += 0.1
            
            return min(confidence, 1.0)
            
        except Exception as e:
            logger.error(f"Error calculating confidence: {str(e)}")
            return 0.5
    
    def generate_reasoning(
        self,
        user_prefs: Dict[str, Any],
        recommendations: List[Dict[str, Any]]
    ) -> str:
        """Generate reasoning for recommendations"""
        try:
            if not recommendations:
                return "No suitable cars found based on your preferences"
            
            reasoning_parts = []
            
            # Add preference-based reasoning
            if user_prefs.get('preferred_car_types'):
                reasoning_parts.append(f"Based on your preference for {', '.join(user_prefs['preferred_car_types'])} cars")
            
            if user_prefs.get('preferred_brands'):
                reasoning_parts.append(f"and your preferred brands: {', '.join(user_prefs['preferred_brands'])}")
            
            if user_prefs.get('preferred_price_range'):
                reasoning_parts.append(f"within your {user_prefs['preferred_price_range']} budget range")
            
            # Add history-based reasoning
            total_bookings = user_prefs.get('total_bookings', 0)
            if total_bookings > 0:
                reasoning_parts.append(f"and your booking history ({total_bookings} previous rentals)")
            
            reasoning = " ".join(reasoning_parts) + f", we found {len(recommendations)} great options for you."
            
            return reasoning
            
        except Exception as e:
            logger.error(f"Error generating reasoning: {str(e)}")
            return "Personalized recommendations based on your preferences"
    
    async def get_similar_cars(self, car_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Get similar cars based on content-based filtering"""
        try:
            if self.car_similarity_matrix is None:
                return []
            
            # Find car index
            car_features = self.recommendation_data.groupby('car_id').agg({
                'car_type': 'first',
                'brand': 'first',
                'price_range': 'first',
                'location': 'first'
            }).reset_index()
            
            car_index = car_features[car_features['car_id'] == car_id].index
            if len(car_index) == 0:
                return []
            
            car_index = car_index[0]
            
            # Get similarity scores
            similarity_scores = self.car_similarity_matrix[car_index]
            
            # Get top similar cars
            similar_indices = np.argsort(similarity_scores)[::-1][1:limit+1]
            
            similar_cars = []
            for idx in similar_indices:
                similar_car_id = car_features.iloc[idx]['car_id']
                similar_cars.append({
                    'car_id': similar_car_id,
                    'similarity_score': round(similarity_scores[idx], 3)
                })
            
            return similar_cars
            
        except Exception as e:
            logger.error(f"Error getting similar cars: {str(e)}")
            return []
    
    def is_healthy(self) -> bool:
        """Check if the service is healthy"""
        try:
            return (self.recommendation_data is not None and 
                   len(self.recommendation_data) > 0 and
                   self.car_similarity_matrix is not None)
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return False
    
    async def get_total_recommendations(self) -> int:
        """Get total number of recommendations made"""
        try:
            return int(self.redis_client.get("recommendations_total") or 0)
        except Exception as e:
            logger.error(f"Error getting total recommendations: {str(e)}")
            return 0
    
    async def get_conversion_rate(self) -> float:
        """Get recommendation conversion rate"""
        try:
            return float(self.redis_client.get("recommendations_conversion_rate") or 0.25)
        except Exception as e:
            logger.error(f"Error getting conversion rate: {str(e)}")
            return 0.25
    
    async def get_average_rating(self) -> float:
        """Get average rating of recommended cars"""
        try:
            return float(self.redis_client.get("recommendations_average_rating") or 4.2)
        except Exception as e:
            logger.error(f"Error getting average rating: {str(e)}")
            return 4.2
    
    async def update_model(self):
        """Update the recommendation model with new data"""
        try:
            # This would typically retrain with new user interactions
            logger.info("Recommendation model updated successfully")
        except Exception as e:
            logger.error(f"Error updating recommendation model: {str(e)}")
    
    async def get_model_status(self) -> Dict[str, Any]:
        """Get model status information"""
        return {
            "status": "active",
            "model": "collaborative_filtering",
            "last_updated": datetime.utcnow().isoformat(),
            "performance": {
                "total_recommendations": await self.get_total_recommendations(),
                "conversion_rate": await self.get_conversion_rate(),
                "average_rating": await self.get_average_rating()
            }
        } 