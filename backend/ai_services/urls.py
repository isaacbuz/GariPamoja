from django.urls import path
from . import views

app_name = 'ai_services'

urlpatterns = [
    # AI Chatbot endpoints
    path('chatbot/', views.ChatbotView.as_view(), name='chatbot'),
    path('chatbot/conversation/', views.ChatbotConversationView.as_view(), name='chatbot-conversation'),
    path('chatbot/history/', views.ChatbotHistoryView.as_view(), name='chatbot-history'),
    
    # AI Pricing endpoints
    path('pricing/suggest/', views.PricingSuggestView.as_view(), name='pricing-suggest'),
    path('pricing/analyze/', views.PricingAnalyzeView.as_view(), name='pricing-analyze'),
    path('pricing/market-data/', views.PricingMarketDataView.as_view(), name='pricing-market-data'),
    path('pricing/model-status/', views.PricingModelStatusView.as_view(), name='pricing-model-status'),
    
    # AI Fraud Detection endpoints
    path('fraud/analyze/', views.FraudAnalyzeView.as_view(), name='fraud-analyze'),
    path('fraud/risk-assessment/', views.FraudRiskAssessmentView.as_view(), name='fraud-risk-assessment'),
    path('fraud/patterns/', views.FraudPatternsView.as_view(), name='fraud-patterns'),
    path('fraud/model-status/', views.FraudModelStatusView.as_view(), name='fraud-model-status'),
    
    # AI Recommendations endpoints
    path('recommendations/cars/', views.CarRecommendationsView.as_view(), name='car-recommendations'),
    path('recommendations/similar/', views.SimilarCarsView.as_view(), name='similar-cars'),
    path('recommendations/personalized/', views.PersonalizedRecommendationsView.as_view(), name='personalized-recommendations'),
    path('recommendations/model-status/', views.RecommendationsModelStatusView.as_view(), name='recommendations-model-status'),
    
    # AI Content Moderation endpoints
    path('moderation/check/', views.ContentModerationView.as_view(), name='content-moderation'),
    path('moderation/batch/', views.BatchModerationView.as_view(), name='batch-moderation'),
    path('moderation/rules/', views.ModerationRulesView.as_view(), name='moderation-rules'),
    path('moderation/model-status/', views.ModerationModelStatusView.as_view(), name='moderation-model-status'),
    
    # AI Model Management
    path('models/status/', views.AIModelsStatusView.as_view(), name='ai-models-status'),
    path('models/update/', views.AIModelsUpdateView.as_view(), name='ai-models-update'),
    path('models/performance/', views.AIModelsPerformanceView.as_view(), name='ai-models-performance'),
    
    # AI Analytics
    path('analytics/usage/', views.AIAnalyticsUsageView.as_view(), name='ai-analytics-usage'),
    path('analytics/performance/', views.AIAnalyticsPerformanceView.as_view(), name='ai-analytics-performance'),
    path('analytics/insights/', views.AIAnalyticsInsightsView.as_view(), name='ai-analytics-insights'),
] 