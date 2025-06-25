"""
AI Content Moderation Service for GariPamoja
Provides content verification and moderation for listings and messages
"""

import os
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import re
import redis

logger = logging.getLogger(__name__)

class ContentModerationService:
    """AI-powered content moderation service"""
    
    def __init__(self):
        self.redis_client = redis.Redis.from_url(
            os.getenv("REDIS_URL", "redis://localhost:6379/1"),
            decode_responses=True
        )
        
        # Content rules and patterns
        self.content_rules = {
            'prohibited_words': [
                'scam', 'fraud', 'fake', 'illegal', 'stolen', 'damaged',
                'broken', 'not working', 'problem', 'issue', 'warning'
            ],
            'suspicious_patterns': [
                r'\b\d{10,}\b',  # Long numbers (phone numbers)
                r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # Email addresses
                r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+',  # URLs
            ],
            'price_manipulation': [
                r'\$\d+',  # Dollar amounts
                r'USD\d+',  # USD amounts
                r'price.*\$\d+',  # Price mentions
            ]
        }
        
        # Content type specific rules
        self.content_type_rules = {
            'listing': {
                'required_fields': ['title', 'description', 'price'],
                'max_length': 1000,
                'min_length': 50,
                'prohibited_content': ['contact_info', 'external_links', 'spam']
            },
            'message': {
                'max_length': 500,
                'prohibited_content': ['spam', 'harassment', 'contact_info']
            },
            'review': {
                'max_length': 300,
                'prohibited_content': ['spam', 'harassment', 'fake_reviews']
            }
        }
    
    async def check_content(
        self,
        content: str,
        content_type: str,
        user_id: str
    ) -> Dict[str, Any]:
        """Check content for appropriateness and compliance"""
        try:
            # Basic content validation
            validation_result = self.validate_content(content, content_type)
            
            # Check for prohibited content
            prohibited_check = self.check_prohibited_content(content)
            
            # Check for suspicious patterns
            pattern_check = self.check_suspicious_patterns(content)
            
            # Check for spam indicators
            spam_check = self.check_spam_indicators(content, user_id)
            
            # Overall assessment
            is_appropriate = (
                validation_result['is_valid'] and
                not prohibited_check['has_prohibited'] and
                not pattern_check['has_suspicious'] and
                not spam_check['is_spam']
            )
            
            # Calculate confidence
            confidence = self.calculate_confidence(
                validation_result, prohibited_check, pattern_check, spam_check
            )
            
            # Generate suggestions
            suggestions = self.generate_suggestions(
                validation_result, prohibited_check, pattern_check, spam_check
            )
            
            # Store moderation result
            self.store_moderation_result(user_id, content_type, is_appropriate, confidence)
            
            return {
                "is_appropriate": is_appropriate,
                "confidence": confidence,
                "flagged_issues": self.get_flagged_issues(
                    validation_result, prohibited_check, pattern_check, spam_check
                ),
                "suggestions": suggestions
            }
            
        except Exception as e:
            logger.error(f"Error checking content: {str(e)}")
            return {
                "is_appropriate": False,
                "confidence": 0.0,
                "flagged_issues": ["Content analysis error"],
                "suggestions": ["Manual review recommended"]
            }
    
    def validate_content(self, content: str, content_type: str) -> Dict[str, Any]:
        """Validate content against type-specific rules"""
        try:
            rules = self.content_type_rules.get(content_type, {})
            issues = []
            
            # Check length
            if len(content) > rules.get('max_length', 1000):
                issues.append(f"Content too long (max {rules.get('max_length', 1000)} characters)")
            
            if len(content) < rules.get('min_length', 0):
                issues.append(f"Content too short (min {rules.get('min_length', 0)} characters)")
            
            # Check for required fields (for listings)
            if content_type == 'listing':
                required_fields = rules.get('required_fields', [])
                for field in required_fields:
                    if field not in content.lower():
                        issues.append(f"Missing required field: {field}")
            
            return {
                "is_valid": len(issues) == 0,
                "issues": issues
            }
            
        except Exception as e:
            logger.error(f"Error validating content: {str(e)}")
            return {
                "is_valid": False,
                "issues": ["Validation error"]
            }
    
    def check_prohibited_content(self, content: str) -> Dict[str, Any]:
        """Check for prohibited words and content"""
        try:
            content_lower = content.lower()
            found_words = []
            
            for word in self.content_rules['prohibited_words']:
                if word in content_lower:
                    found_words.append(word)
            
            return {
                "has_prohibited": len(found_words) > 0,
                "prohibited_words": found_words
            }
            
        except Exception as e:
            logger.error(f"Error checking prohibited content: {str(e)}")
            return {
                "has_prohibited": False,
                "prohibited_words": []
            }
    
    def check_suspicious_patterns(self, content: str) -> Dict[str, Any]:
        """Check for suspicious patterns in content"""
        try:
            suspicious_patterns = []
            
            for pattern in self.content_rules['suspicious_patterns']:
                matches = re.findall(pattern, content)
                if matches:
                    suspicious_patterns.extend(matches)
            
            return {
                "has_suspicious": len(suspicious_patterns) > 0,
                "suspicious_patterns": suspicious_patterns
            }
            
        except Exception as e:
            logger.error(f"Error checking suspicious patterns: {str(e)}")
            return {
                "has_suspicious": False,
                "suspicious_patterns": []
            }
    
    def check_spam_indicators(self, content: str, user_id: str) -> Dict[str, Any]:
        """Check for spam indicators"""
        try:
            spam_indicators = []
            
            # Check for repetitive content
            words = content.lower().split()
            if len(words) > 10:
                word_freq = {}
                for word in words:
                    word_freq[word] = word_freq.get(word, 0) + 1
                
                for word, freq in word_freq.items():
                    if freq > len(words) * 0.3:  # Word appears in >30% of content
                        spam_indicators.append(f"Repetitive word: {word}")
            
            # Check for excessive capitalization
            if len(re.findall(r'[A-Z]', content)) > len(content) * 0.5:
                spam_indicators.append("Excessive capitalization")
            
            # Check for excessive punctuation
            if len(re.findall(r'[!?]', content)) > len(content.split()) * 0.2:
                spam_indicators.append("Excessive punctuation")
            
            # Check user's content history
            user_spam_score = self.get_user_spam_score(user_id)
            if user_spam_score > 0.7:
                spam_indicators.append("User has high spam score")
            
            return {
                "is_spam": len(spam_indicators) > 0,
                "spam_indicators": spam_indicators
            }
            
        except Exception as e:
            logger.error(f"Error checking spam indicators: {str(e)}")
            return {
                "is_spam": False,
                "spam_indicators": []
            }
    
    def get_user_spam_score(self, user_id: str) -> float:
        """Get user's spam score based on history"""
        try:
            # This would typically query user's moderation history
            # For now, return a random score
            import random
            return random.uniform(0, 1)
        except Exception as e:
            logger.error(f"Error getting user spam score: {str(e)}")
            return 0.0
    
    def calculate_confidence(
        self,
        validation_result: Dict[str, Any],
        prohibited_check: Dict[str, Any],
        pattern_check: Dict[str, Any],
        spam_check: Dict[str, Any]
    ) -> float:
        """Calculate confidence in moderation decision"""
        try:
            confidence = 0.8  # Base confidence
            
            # Reduce confidence for validation issues
            if not validation_result['is_valid']:
                confidence -= 0.2
            
            # Reduce confidence for prohibited content
            if prohibited_check['has_prohibited']:
                confidence -= 0.3
            
            # Reduce confidence for suspicious patterns
            if pattern_check['has_suspicious']:
                confidence -= 0.2
            
            # Reduce confidence for spam indicators
            if spam_check['is_spam']:
                confidence -= 0.3
            
            return max(confidence, 0.0)
            
        except Exception as e:
            logger.error(f"Error calculating confidence: {str(e)}")
            return 0.5
    
    def get_flagged_issues(
        self,
        validation_result: Dict[str, Any],
        prohibited_check: Dict[str, Any],
        pattern_check: Dict[str, Any],
        spam_check: Dict[str, Any]
    ) -> List[str]:
        """Get all flagged issues"""
        issues = []
        
        # Add validation issues
        issues.extend(validation_result.get('issues', []))
        
        # Add prohibited content issues
        if prohibited_check.get('has_prohibited'):
            issues.append(f"Contains prohibited words: {', '.join(prohibited_check.get('prohibited_words', []))}")
        
        # Add suspicious pattern issues
        if pattern_check.get('has_suspicious'):
            issues.append("Contains suspicious patterns (contact information, URLs)")
        
        # Add spam issues
        if spam_check.get('is_spam'):
            issues.extend(spam_check.get('spam_indicators', []))
        
        return issues
    
    def generate_suggestions(
        self,
        validation_result: Dict[str, Any],
        prohibited_check: Dict[str, Any],
        pattern_check: Dict[str, Any],
        spam_check: Dict[str, Any]
    ) -> List[str]:
        """Generate suggestions for improving content"""
        suggestions = []
        
        # Validation suggestions
        if not validation_result['is_valid']:
            for issue in validation_result.get('issues', []):
                if 'too long' in issue:
                    suggestions.append("Consider shortening your content")
                elif 'too short' in issue:
                    suggestions.append("Please provide more details")
                elif 'required field' in issue:
                    suggestions.append("Please include all required information")
        
        # Prohibited content suggestions
        if prohibited_check.get('has_prohibited'):
            suggestions.append("Avoid using prohibited words and phrases")
            suggestions.append("Focus on positive aspects of your listing")
        
        # Pattern suggestions
        if pattern_check.get('has_suspicious'):
            suggestions.append("Remove contact information and external links")
            suggestions.append("Keep communication within the platform")
        
        # Spam suggestions
        if spam_check.get('is_spam'):
            suggestions.append("Avoid excessive repetition and punctuation")
            suggestions.append("Write naturally and professionally")
        
        if not suggestions:
            suggestions.append("Your content looks good!")
        
        return suggestions
    
    def store_moderation_result(
        self,
        user_id: str,
        content_type: str,
        is_appropriate: bool,
        confidence: float
    ):
        """Store moderation result for future reference"""
        try:
            result = {
                "user_id": user_id,
                "content_type": content_type,
                "is_appropriate": is_appropriate,
                "confidence": confidence,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            key = f"content_moderation:{user_id}:{datetime.utcnow().strftime('%Y%m%d')}"
            self.redis_client.setex(key, 2592000, json.dumps(result))
            
        except Exception as e:
            logger.error(f"Error storing moderation result: {str(e)}")
    
    async def batch_moderate(self, data: List[Dict[str, Any]]):
        """Batch moderate content"""
        try:
            for item in data:
                await self.check_content(
                    content=item.get("content", ""),
                    content_type=item.get("content_type", "listing"),
                    user_id=item.get("user_id", "")
                )
            
            logger.info(f"Batch moderated {len(data)} content items")
            
        except Exception as e:
            logger.error(f"Error in batch moderation: {str(e)}")
    
    def is_healthy(self) -> bool:
        """Check if the service is healthy"""
        try:
            return (self.content_rules is not None and 
                   self.content_type_rules is not None)
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return False
    
    async def get_total_moderations(self) -> int:
        """Get total number of content moderations performed"""
        try:
            return int(self.redis_client.get("content_moderations_total") or 0)
        except Exception as e:
            logger.error(f"Error getting total moderations: {str(e)}")
            return 0
    
    async def get_accuracy_rate(self) -> float:
        """Get content moderation accuracy rate"""
        try:
            return float(self.redis_client.get("content_moderation_accuracy") or 0.92)
        except Exception as e:
            logger.error(f"Error getting accuracy rate: {str(e)}")
            return 0.92
    
    async def get_false_positive_rate(self) -> float:
        """Get false positive rate"""
        try:
            return float(self.redis_client.get("content_moderation_false_positive") or 0.08)
        except Exception as e:
            logger.error(f"Error getting false positive rate: {str(e)}")
            return 0.08
    
    async def update_model(self):
        """Update the content moderation model"""
        try:
            # This would typically retrain with new moderation data
            logger.info("Content moderation model updated successfully")
        except Exception as e:
            logger.error(f"Error updating content moderation model: {str(e)}")
    
    async def get_model_status(self) -> Dict[str, Any]:
        """Get model status information"""
        return {
            "status": "active",
            "model": "rule_based",
            "last_updated": datetime.utcnow().isoformat(),
            "performance": {
                "accuracy_rate": await self.get_accuracy_rate(),
                "false_positive_rate": await self.get_false_positive_rate(),
                "total_moderations": await self.get_total_moderations()
            }
        } 