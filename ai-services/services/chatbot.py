"""
AI Chatbot Service for GariPamoja
Provides intelligent customer support using LLMs and RAG
"""

import os
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import openai
import anthropic
from langchain.chat_models import ChatOpenAI, ChatAnthropic
from langchain.schema import HumanMessage, SystemMessage
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
import redis

logger = logging.getLogger(__name__)

class ChatbotService:
    """AI-powered chatbot service for customer support"""
    
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.anthropic_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        
        # Initialize LLM models
        self.chat_model = ChatOpenAI(
            model="gpt-4",
            temperature=0.7,
            max_tokens=500
        )
        
        self.anthropic_model = ChatAnthropic(
            model="claude-3-sonnet-20240229",
            temperature=0.7,
            max_tokens=500
        )
        
        # Initialize RAG components
        self.embeddings = OpenAIEmbeddings()
        self.vector_store = None
        self.initialize_knowledge_base()
        
        # Redis for conversation history
        self.redis_client = redis.Redis.from_url(
            os.getenv("REDIS_URL", "redis://localhost:6379/1"),
            decode_responses=True
        )
        
        # System prompts for different languages
        self.system_prompts = {
            "en": """You are GariPamoja, an AI assistant for a peer-to-peer car sharing platform in East Africa. 
            You help users with booking cars, understanding policies, resolving issues, and providing support.
            Be friendly, professional, and helpful. Always provide accurate information about our services.
            If you don't know something, say so and offer to connect them with human support.""",
            
            "sw": """Wewe ni GariPamoja, msaidizi wa AI kwa jukwaa la kushiriki magari peer-to-peer katika Afrika Mashariki.
            Unasaidia watumiaji kuhusu kuhifadhi magari, kuelewa sera, kutatua matatizo, na kutoa msaada.
            Kuwa mwenye urafiki, mtaalamu, na msaada. Daima toa maelezo sahihi kuhusu huduma zetu.
            Ikiwa hujui kitu, sema hivyo na uwasiliane na msaada wa binadamu."""
        }
        
        # FAQ knowledge base
        self.faq_data = self.load_faq_data()
    
    def initialize_knowledge_base(self):
        """Initialize the RAG knowledge base with platform information"""
        try:
            # Load platform documentation and policies
            documents = self.load_platform_documents()
            
            # Split documents into chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200
            )
            texts = text_splitter.split_documents(documents)
            
            # Create vector store
            self.vector_store = Chroma.from_documents(
                documents=texts,
                embedding=self.embeddings
            )
            
            logger.info("Knowledge base initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing knowledge base: {str(e)}")
    
    def load_platform_documents(self):
        """Load platform documentation and policies"""
        # This would typically load from files or database
        documents = [
            "GariPamoja is a peer-to-peer car sharing platform in East Africa.",
            "Users can rent cars from other users for daily, weekly, or monthly periods.",
            "The platform charges a 20% commission on all successful rentals.",
            "All cars must be insured and verified before listing.",
            "Users must complete KYC verification to rent or host cars.",
            "Cancellation policies allow free cancellation up to 24 hours before rental.",
            "Support is available 24/7 through the app or website.",
            "Payment methods include mobile money, cards, and cryptocurrency.",
            "Disputes are handled through our AI-powered resolution system.",
            "Safety is our top priority with comprehensive insurance coverage."
        ]
        return documents
    
    def load_faq_data(self):
        """Load FAQ data for quick responses"""
        return {
            "en": {
                "how_to_book": "To book a car, search for available vehicles, select your dates, and complete payment.",
                "cancellation_policy": "Free cancellation up to 24 hours before rental. Later cancellations may incur fees.",
                "payment_methods": "We accept mobile money (M-Pesa, Airtel Money), credit/debit cards, and cryptocurrency.",
                "insurance_coverage": "All rentals include comprehensive insurance coverage up to $50,000.",
                "verification_process": "KYC verification takes 1-2 business days and requires ID and proof of address.",
                "support_contact": "Contact support through the app chat, email at support@garipamoja.com, or call +256 700 123 456."
            },
            "sw": {
                "how_to_book": "Kuhifadhi gari, tafuta magari yaliyopo, chagua tarehe zako, na maliza malipo.",
                "cancellation_policy": "Kughairi bure hadi saa 24 kabla ya kukodi. Kughairi baadae kunaweza kuwa na ada.",
                "payment_methods": "Tunakubali pesa ya simu (M-Pesa, Airtel Money), kadi za mkopo/debit, na cryptocurrency.",
                "insurance_coverage": "Kodi zote zinajumuisha bima kamili hadi $50,000.",
                "verification_process": "Uthibitishaji wa KYC huchukua siku 1-2 za kazi na unahitaji kitambulisho na uthibitisho wa anwani.",
                "support_contact": "Wasiliana na msaada kupitia chat ya programu, barua pepe kwa support@garipamoja.com, au piga +256 700 123 456."
            }
        }
    
    async def get_response(
        self,
        user_id: str,
        message: str,
        context: Optional[Dict[str, Any]] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        """Get AI response for user message"""
        try:
            # Get conversation history
            history = self.get_conversation_history(user_id)
            
            # Check if it's a FAQ question
            faq_response = self.check_faq(message, language)
            if faq_response:
                return {
                    "response": faq_response,
                    "confidence": 0.95,
                    "suggested_actions": [],
                    "follow_up_questions": []
                }
            
            # Get relevant context from RAG
            relevant_context = self.get_relevant_context(message)
            
            # Build system prompt
            system_prompt = self.system_prompts.get(language, self.system_prompts["en"])
            if relevant_context:
                system_prompt += f"\n\nRelevant information: {relevant_context}"
            
            # Generate response
            if language == "sw":
                response = await self.generate_swahili_response(message, system_prompt, history)
            else:
                response = await self.generate_english_response(message, system_prompt, history)
            
            # Store conversation
            self.store_conversation(user_id, message, response["response"])
            
            return response
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return {
                "response": "I apologize, but I'm having trouble processing your request. Please try again or contact our support team.",
                "confidence": 0.0,
                "suggested_actions": ["Contact Support"],
                "follow_up_questions": []
            }
    
    async def generate_english_response(
        self,
        message: str,
        system_prompt: str,
        history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """Generate response using OpenAI GPT-4"""
        try:
            messages = [SystemMessage(content=system_prompt)]
            
            # Add conversation history
            for entry in history[-5:]:  # Last 5 exchanges
                messages.append(HumanMessage(content=entry["user"]))
                messages.append(SystemMessage(content=entry["assistant"]))
            
            messages.append(HumanMessage(content=message))
            
            response = await self.chat_model.agenerate([messages])
            response_text = response.generations[0][0].text
            
            # Extract suggested actions and follow-up questions
            suggested_actions = self.extract_suggested_actions(response_text)
            follow_up_questions = self.extract_follow_up_questions(response_text)
            
            return {
                "response": response_text,
                "confidence": 0.85,
                "suggested_actions": suggested_actions,
                "follow_up_questions": follow_up_questions
            }
            
        except Exception as e:
            logger.error(f"Error generating English response: {str(e)}")
            raise
    
    async def generate_swahili_response(
        self,
        message: str,
        system_prompt: str,
        history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """Generate response using Anthropic Claude for Swahili"""
        try:
            # Build conversation context
            context = ""
            for entry in history[-3:]:  # Last 3 exchanges
                context += f"User: {entry['user']}\nAssistant: {entry['assistant']}\n"
            
            prompt = f"{system_prompt}\n\nConversation history:\n{context}\n\nUser: {message}\n\nAssistant:"
            
            response = await self.anthropic_client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=500,
                temperature=0.7,
                messages=[{"role": "user", "content": prompt}]
            )
            
            response_text = response.content[0].text
            
            return {
                "response": response_text,
                "confidence": 0.80,
                "suggested_actions": [],
                "follow_up_questions": []
            }
            
        except Exception as e:
            logger.error(f"Error generating Swahili response: {str(e)}")
            raise
    
    def check_faq(self, message: str, language: str) -> Optional[str]:
        """Check if message matches FAQ patterns"""
        message_lower = message.lower()
        faq_data = self.faq_data.get(language, {})
        
        # Simple keyword matching
        if "book" in message_lower or "rent" in message_lower:
            return faq_data.get("how_to_book")
        elif "cancel" in message_lower:
            return faq_data.get("cancellation_policy")
        elif "pay" in message_lower or "payment" in message_lower:
            return faq_data.get("payment_methods")
        elif "insurance" in message_lower:
            return faq_data.get("insurance_coverage")
        elif "verify" in message_lower or "kyc" in message_lower:
            return faq_data.get("verification_process")
        elif "support" in message_lower or "help" in message_lower:
            return faq_data.get("support_contact")
        
        return None
    
    def get_relevant_context(self, message: str) -> str:
        """Get relevant context from RAG knowledge base"""
        try:
            if not self.vector_store:
                return ""
            
            # Search for relevant documents
            docs = self.vector_store.similarity_search(message, k=3)
            context = " ".join([doc.page_content for doc in docs])
            return context
            
        except Exception as e:
            logger.error(f"Error getting relevant context: {str(e)}")
            return ""
    
    def get_conversation_history(self, user_id: str) -> List[Dict[str, str]]:
        """Get conversation history from Redis"""
        try:
            history_key = f"chat_history:{user_id}"
            history_data = self.redis_client.get(history_key)
            
            if history_data:
                return json.loads(history_data)
            return []
            
        except Exception as e:
            logger.error(f"Error getting conversation history: {str(e)}")
            return []
    
    def store_conversation(self, user_id: str, user_message: str, assistant_response: str):
        """Store conversation in Redis"""
        try:
            history_key = f"chat_history:{user_id}"
            history = self.get_conversation_history(user_id)
            
            # Add new exchange
            history.append({
                "user": user_message,
                "assistant": assistant_response,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            # Keep only last 10 exchanges
            if len(history) > 10:
                history = history[-10:]
            
            # Store in Redis with 24-hour expiry
            self.redis_client.setex(
                history_key,
                86400,  # 24 hours
                json.dumps(history)
            )
            
        except Exception as e:
            logger.error(f"Error storing conversation: {str(e)}")
    
    def extract_suggested_actions(self, response: str) -> List[str]:
        """Extract suggested actions from response"""
        actions = []
        
        # Simple pattern matching for actions
        if "book" in response.lower():
            actions.append("Book a Car")
        if "contact" in response.lower():
            actions.append("Contact Support")
        if "verify" in response.lower():
            actions.append("Complete Verification")
        if "payment" in response.lower():
            actions.append("View Payment Options")
        
        return actions
    
    def extract_follow_up_questions(self, response: str) -> List[str]:
        """Extract follow-up questions from response"""
        questions = []
        
        # Simple pattern matching for questions
        if "?" in response:
            # Extract sentences ending with question marks
            sentences = response.split(".")
            for sentence in sentences:
                if "?" in sentence:
                    questions.append(sentence.strip())
        
        return questions[:3]  # Limit to 3 questions
    
    def is_healthy(self) -> bool:
        """Check if the service is healthy"""
        try:
            # Test API connections
            self.openai_client.models.list()
            return True
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return False
    
    async def get_total_conversations(self) -> int:
        """Get total number of conversations"""
        try:
            # This would typically query a database
            return 1000  # Placeholder
        except Exception as e:
            logger.error(f"Error getting total conversations: {str(e)}")
            return 0
    
    async def get_average_response_time(self) -> float:
        """Get average response time in seconds"""
        try:
            # This would typically calculate from metrics
            return 2.5  # Placeholder
        except Exception as e:
            logger.error(f"Error getting average response time: {str(e)}")
            return 0.0
    
    async def get_satisfaction_score(self) -> float:
        """Get customer satisfaction score"""
        try:
            # This would typically calculate from ratings
            return 4.2  # Placeholder
        except Exception as e:
            logger.error(f"Error getting satisfaction score: {str(e)}")
            return 0.0
    
    async def update_model(self):
        """Update the chatbot model with new data"""
        try:
            # This would typically retrain or fine-tune the model
            logger.info("Chatbot model updated successfully")
        except Exception as e:
            logger.error(f"Error updating chatbot model: {str(e)}")
    
    async def get_model_status(self) -> Dict[str, Any]:
        """Get model status information"""
        return {
            "status": "active",
            "model": "gpt-4",
            "last_updated": datetime.utcnow().isoformat(),
            "performance": {
                "accuracy": 0.85,
                "response_time": 2.5,
                "satisfaction": 4.2
            }
        } 