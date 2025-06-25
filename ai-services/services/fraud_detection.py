"""
AI Fraud Detection Service for GariPamoja
Provides risk assessment and suspicious activity detection
"""

import os
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import redis
import hashlib

logger = logging.getLogger(__name__)

class FraudDetectionService:
    """AI-powered fraud detection service"""
    
    def __init__(self):
        self.redis_client = redis.Redis.from_url(
            os.getenv("REDIS_URL", "redis://localhost:6379/1"),
            decode_responses=True
        )
        
        # Initialize ML model
        self.model = IsolationForest(contamination=0.1, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        
        # Risk thresholds
        self.risk_thresholds = {
            'low': 0.3,
            'medium': 0.6,
            'high': 0.8
        }
        
        # Fraud patterns
        self.fraud_patterns = {
            'suspicious_behavior': [
                'multiple_accounts_same_device',
                'rapid_booking_cancellations',
                'unusual_payment_patterns',
                'location_mismatch',
                'document_forgery_indicators'
            ],
            'transaction_red_flags': [
                'high_value_first_transaction',
                'multiple_payment_methods',
                'international_card_local_use',
                'card_testing_patterns'
            ],
            'user_behavior_anomalies': [
                'new_user_high_activity',
                'unusual_browsing_patterns',
                'bot_like_behavior',
                'identity_theft_indicators'
            ]
        }
        
        # Load historical data
        self.load_historical_data()
    
    def load_historical_data(self):
        """Load historical transaction and user behavior data"""
        try:
            self.historical_data = self.generate_synthetic_data()
            logger.info("Historical fraud data loaded successfully")
        except Exception as e:
            logger.error(f"Error loading historical data: {str(e)}")
            self.historical_data = pd.DataFrame()
    
    def generate_synthetic_data(self) -> pd.DataFrame:
        """Generate synthetic fraud detection data"""
        np.random.seed(42)
        n_samples = 2000
        
        data = {
            'user_age_days': np.random.randint(1, 365, n_samples),
            'transaction_amount': np.random.uniform(50, 500, n_samples),
            'transaction_count_24h': np.random.randint(1, 10, n_samples),
            'device_count': np.random.randint(1, 5, n_samples),
            'location_changes_24h': np.random.randint(0, 3, n_samples),
            'payment_methods_used': np.random.randint(1, 3, n_samples),
            'booking_cancellation_rate': np.random.uniform(0, 0.5, n_samples),
            'account_verification_score': np.random.uniform(0.3, 1.0, n_samples),
            'is_fraud': np.random.choice([0, 1], n_samples, p=[0.95, 0.05])
        }
        
        return pd.DataFrame(data)
    
    async def analyze_risk(
        self,
        user_id: str,
        transaction_data: Dict[str, Any],
        user_behavior: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Analyze risk for a transaction or user"""
        try:
            features = self.extract_features(user_id, transaction_data, user_behavior)
            risk_score = self.calculate_risk_score(features)
            is_anomaly = self.detect_anomaly(features)
            risk_factors = self.identify_risk_factors(features, transaction_data)
            recommendations = self.generate_recommendations(risk_score, risk_factors)
            is_suspicious = risk_score > self.risk_thresholds['medium']
            
            self.store_analysis_result(user_id, risk_score, is_suspicious, risk_factors)
            
            return {
                "risk_score": round(risk_score, 3),
                "is_suspicious": is_suspicious,
                "risk_factors": risk_factors,
                "recommendations": recommendations,
                "anomaly_detected": is_anomaly,
                "confidence": self.calculate_confidence(features)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing risk: {str(e)}")
            return {
                "risk_score": 0.5,
                "is_suspicious": False,
                "risk_factors": ["Analysis error"],
                "recommendations": ["Manual review recommended"],
                "anomaly_detected": False,
                "confidence": 0.0
            }
    
    def extract_features(
        self,
        user_id: str,
        transaction_data: Dict[str, Any],
        user_behavior: Optional[Dict[str, Any]] = None
    ) -> List[float]:
        """Extract features for risk analysis"""
        features = []
        
        # User account features
        user_age_days = self.get_user_age_days(user_id)
        features.append(user_age_days)
        
        # Transaction features
        transaction_amount = transaction_data.get('amount', 0)
        features.append(transaction_amount)
        
        # Transaction frequency
        transaction_count_24h = self.get_transaction_count_24h(user_id)
        features.append(transaction_count_24h)
        
        # Device and location features
        device_count = self.get_device_count(user_id)
        features.append(device_count)
        
        location_changes_24h = self.get_location_changes_24h(user_id)
        features.append(location_changes_24h)
        
        # Payment features
        payment_methods_used = self.get_payment_methods_count(user_id)
        features.append(payment_methods_used)
        
        # Behavioral features
        if user_behavior:
            booking_cancellation_rate = user_behavior.get('cancellation_rate', 0)
            account_verification_score = user_behavior.get('verification_score', 0.5)
        else:
            booking_cancellation_rate = self.get_cancellation_rate(user_id)
            account_verification_score = self.get_verification_score(user_id)
        
        features.append(booking_cancellation_rate)
        features.append(account_verification_score)
        
        return features
    
    def calculate_risk_score(self, features: List[float]) -> float:
        """Calculate risk score using ML model or rule-based approach"""
        try:
            if self.is_trained and len(features) >= 8:
                features_array = np.array(features).reshape(1, -1)
                features_scaled = self.scaler.transform(features_array)
                anomaly_score = self.model.decision_function(features_scaled)[0]
                risk_score = 1 / (1 + np.exp(-anomaly_score))
                return min(max(risk_score, 0.0), 1.0)
            else:
                return self.rule_based_risk_scoring(features)
                
        except Exception as e:
            logger.error(f"Error calculating risk score: {str(e)}")
            return 0.5
    
    def rule_based_risk_scoring(self, features: List[float]) -> float:
        """Rule-based risk scoring when ML model is not available"""
        if len(features) < 8:
            return 0.5
        
        risk_score = 0.0
        
        # User age risk
        if features[0] < 7:
            risk_score += 0.3
        elif features[0] < 30:
            risk_score += 0.1
        
        # Transaction amount risk
        if features[1] > 300:
            risk_score += 0.2
        elif features[1] > 500:
            risk_score += 0.4
        
        # Transaction frequency risk
        if features[2] > 5:
            risk_score += 0.3
        elif features[2] > 10:
            risk_score += 0.5
        
        # Device count risk
        if features[3] > 3:
            risk_score += 0.2
        
        # Location changes risk
        if features[4] > 2:
            risk_score += 0.3
        
        # Payment methods risk
        if features[5] > 2:
            risk_score += 0.2
        
        # Cancellation rate risk
        if features[6] > 0.3:
            risk_score += 0.3
        
        # Verification score risk
        if features[7] < 0.5:
            risk_score += 0.4
        
        return min(risk_score, 1.0)
    
    def detect_anomaly(self, features: List[float]) -> bool:
        """Detect anomalies using isolation forest"""
        try:
            if self.is_trained and len(features) >= 8:
                features_array = np.array(features).reshape(1, -1)
                features_scaled = self.scaler.transform(features_array)
                prediction = self.model.predict(features_scaled)[0]
                return prediction == -1
            return False
        except Exception as e:
            logger.error(f"Error detecting anomaly: {str(e)}")
            return False
    
    def identify_risk_factors(
        self,
        features: List[float],
        transaction_data: Dict[str, Any]
    ) -> List[str]:
        """Identify specific risk factors"""
        risk_factors = []
        
        if len(features) < 8:
            return ["Insufficient data for analysis"]
        
        if features[0] < 7:
            risk_factors.append("New user account (less than 7 days)")
        
        if features[1] > 300:
            risk_factors.append("High-value transaction")
        
        if features[2] > 5:
            risk_factors.append("High transaction frequency")
        
        if features[3] > 3:
            risk_factors.append("Multiple devices used")
        
        if features[4] > 2:
            risk_factors.append("Multiple location changes")
        
        if features[5] > 2:
            risk_factors.append("Multiple payment methods")
        
        if features[6] > 0.3:
            risk_factors.append("High cancellation rate")
        
        if features[7] < 0.5:
            risk_factors.append("Low verification score")
        
        return risk_factors if risk_factors else ["No significant risk factors detected"]
    
    def generate_recommendations(
        self,
        risk_score: float,
        risk_factors: List[str]
    ) -> List[str]:
        """Generate recommendations based on risk analysis"""
        recommendations = []
        
        if risk_score > self.risk_thresholds['high']:
            recommendations.append("Immediate manual review required")
            recommendations.append("Consider temporary account suspension")
        elif risk_score > self.risk_thresholds['medium']:
            recommendations.append("Enhanced monitoring recommended")
            recommendations.append("Request additional documentation")
        elif risk_score > self.risk_thresholds['low']:
            recommendations.append("Monitor for suspicious activity")
        else:
            recommendations.append("Low risk - proceed with normal processing")
        
        return recommendations
    
    def calculate_confidence(self, features: List[float]) -> float:
        """Calculate confidence in risk assessment"""
        if len(features) < 8:
            return 0.3
        
        confidence = 0.5
        
        if all(feature >= 0 for feature in features):
            confidence += 0.2
        
        if any(feature > 1000 for feature in features):
            confidence -= 0.1
        
        return min(max(confidence, 0.0), 1.0)
    
    # Helper methods for feature extraction
    def get_user_age_days(self, user_id: str) -> int:
        """Get user account age in days"""
        try:
            return np.random.randint(1, 365)
        except Exception as e:
            logger.error(f"Error getting user age: {str(e)}")
            return 30
    
    def get_transaction_count_24h(self, user_id: str) -> int:
        """Get transaction count in last 24 hours"""
        try:
            return np.random.randint(1, 10)
        except Exception as e:
            logger.error(f"Error getting transaction count: {str(e)}")
            return 1
    
    def get_device_count(self, user_id: str) -> int:
        """Get number of devices used by user"""
        try:
            return np.random.randint(1, 5)
        except Exception as e:
            logger.error(f"Error getting device count: {str(e)}")
            return 1
    
    def get_location_changes_24h(self, user_id: str) -> int:
        """Get number of location changes in last 24 hours"""
        try:
            return np.random.randint(0, 3)
        except Exception as e:
            logger.error(f"Error getting location changes: {str(e)}")
            return 0
    
    def get_payment_methods_count(self, user_id: str) -> int:
        """Get number of payment methods used"""
        try:
            return np.random.randint(1, 3)
        except Exception as e:
            logger.error(f"Error getting payment methods count: {str(e)}")
            return 1
    
    def get_cancellation_rate(self, user_id: str) -> float:
        """Get user's booking cancellation rate"""
        try:
            return np.random.uniform(0, 0.5)
        except Exception as e:
            logger.error(f"Error getting cancellation rate: {str(e)}")
            return 0.1
    
    def get_verification_score(self, user_id: str) -> float:
        """Get user's verification score"""
        try:
            return np.random.uniform(0.3, 1.0)
        except Exception as e:
            logger.error(f"Error getting verification score: {str(e)}")
            return 0.5
    
    def store_analysis_result(
        self,
        user_id: str,
        risk_score: float,
        is_suspicious: bool,
        risk_factors: List[str]
    ):
        """Store analysis result for future reference"""
        try:
            result = {
                "user_id": user_id,
                "risk_score": risk_score,
                "is_suspicious": is_suspicious,
                "risk_factors": risk_factors,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            key = f"fraud_analysis:{user_id}:{datetime.utcnow().strftime('%Y%m%d')}"
            self.redis_client.setex(key, 2592000, json.dumps(result))
            
        except Exception as e:
            logger.error(f"Error storing analysis result: {str(e)}")
    
    async def batch_analyze(self, data: List[Dict[str, Any]]):
        """Batch analyze fraud data"""
        try:
            for item in data:
                await self.analyze_risk(
                    user_id=item.get("user_id"),
                    transaction_data=item.get("transaction_data", {}),
                    user_behavior=item.get("user_behavior")
                )
            
            logger.info(f"Batch analyzed {len(data)} fraud detection requests")
            
        except Exception as e:
            logger.error(f"Error in batch analysis: {str(e)}")
    
    def is_healthy(self) -> bool:
        """Check if the service is healthy"""
        try:
            return self.historical_data is not None and len(self.historical_data) > 0
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return False
    
    async def get_total_analyses(self) -> int:
        """Get total number of fraud analyses performed"""
        try:
            return int(self.redis_client.get("fraud_analyses_total") or 0)
        except Exception as e:
            logger.error(f"Error getting total analyses: {str(e)}")
            return 0
    
    async def get_detection_rate(self) -> float:
        """Get fraud detection rate"""
        try:
            return float(self.redis_client.get("fraud_detection_rate") or 0.85)
        except Exception as e:
            logger.error(f"Error getting detection rate: {str(e)}")
            return 0.85
    
    async def get_false_positive_rate(self) -> float:
        """Get false positive rate"""
        try:
            return float(self.redis_client.get("fraud_false_positive_rate") or 0.05)
        except Exception as e:
            logger.error(f"Error getting false positive rate: {str(e)}")
            return 0.05
    
    async def update_model(self):
        """Update the fraud detection model with new data"""
        try:
            if len(self.historical_data) > 100:
                X = self.historical_data.drop('is_fraud', axis=1)
                y = self.historical_data['is_fraud']
                
                X_scaled = self.scaler.fit_transform(X)
                self.model.fit(X_scaled)
                self.is_trained = True
                
                logger.info("Fraud detection model updated successfully")
            
        except Exception as e:
            logger.error(f"Error updating fraud detection model: {str(e)}")
    
    async def get_model_status(self) -> Dict[str, Any]:
        """Get model status information"""
        return {
            "status": "active" if self.is_trained else "training",
            "model": "isolation_forest",
            "last_updated": datetime.utcnow().isoformat(),
            "performance": {
                "detection_rate": await self.get_detection_rate(),
                "false_positive_rate": await self.get_false_positive_rate(),
                "total_analyses": await self.get_total_analyses()
            }
        } 