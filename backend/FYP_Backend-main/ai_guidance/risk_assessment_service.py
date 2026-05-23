"""
Risk Assessment Service for Mandatory Coach Assignment
Determines when a user must hire a coach based on risk scores
"""

from django.db.models import Avg
from django.utils import timezone
from datetime import timedelta
from session_log.models import session_log
from coach_client.models import coach_client


class RiskAssessmentService:
    """Service for evaluating user risk levels and mandatory coaching requirements"""
    
    HIGH_RISK_THRESHOLD = 65  # Percentage (0-100)
    HISTORICAL_LOOKBACK_DAYS = 90  # 3 months
    
    @staticmethod
    def calculate_risk_score(session):
        """Calculate risk score for a session (0-100)"""
        risk_mapping = {
            'critical': 90,
            'high': 75,
            'moderate': 50,
            'medium': 50,
            'low': 20,
        }
        
        if session.highest_risk_score:
            return session.highest_risk_score
        
        risk_level = session.risk_level or 'low'
        return risk_mapping.get(risk_level.lower(), 20)
    
    @staticmethod
    def get_historical_risk_data(client_id, days=90):
        """Get historical risk data for the past N days"""
        cutoff_date = timezone.now().date() - timedelta(days=days)
        
        sessions = session_log.objects.filter(
            client_id=client_id,
            date__gte=cutoff_date
        ).order_by('date')
        
        if not sessions.exists():
            return {
                'average_score': 0,
                'trend': 'insufficient_data',
                'sessions': [],
                'has_data': False
            }
        
        risk_scores = []
        session_data = []
        
        for session in sessions:
            score = RiskAssessmentService.calculate_risk_score(session)
            risk_scores.append(score)
            session_data.append({
                'session_id': session.session_id,
                'date': session.date,
                'score': score,
                'risk_level': session.risk_level
            })
        
        average_score = sum(risk_scores) / len(risk_scores) if risk_scores else 0
        trend = RiskAssessmentService._calculate_trend(risk_scores)
        
        return {
            'average_score': average_score,
            'trend': trend,
            'sessions': session_data,
            'has_data': True,
            'high_risk_count': sum(1 for score in risk_scores if score > 65)
        }
    
    @staticmethod
    def _calculate_trend(scores):
        """Calculate trend from scores"""
        if len(scores) < 2:
            return 'insufficient_data'
        
        n = len(scores)
        x_mean = (n - 1) / 2
        y_mean = sum(scores) / n
        
        numerator = sum((i - x_mean) * (scores[i] - y_mean) for i in range(n))
        denominator = sum((i - x_mean) ** 2 for i in range(n))
        
        if denominator == 0:
            return 'stable'
        
        slope = numerator / denominator
        
        if slope > 5:
            return 'increasing'
        elif slope < -5:
            return 'decreasing'
        else:
            return 'stable'
    
    @staticmethod
    def is_coach_assigned(client_id):
        """Check if client has an assigned coach"""
        assignment = coach_client.objects.filter(
            client_id=client_id,
            status__in=['active', 'assigned']
        ).first()
        
        if assignment:
            return True, assignment.coach_id.coach_id
        return False, None
    
    @staticmethod
    def check_mandatory_coaching_status(client_id):
        """
        Main method to determine if user is locked and must hire a coach
        
        Returns dict with is_locked, reason, risk scores, etc.
        """
        # Check if coach already assigned
        has_coach, coach_id = RiskAssessmentService.is_coach_assigned(client_id)
        
        if has_coach:
            return {
                'is_locked': False,
                'reason': 'coach_already_assigned',
                'has_coach': True,
                'coach_id': coach_id,
                'current_risk_score': None,
                'historical_data': None
            }
        
        # Get most recent session
        latest_session = session_log.objects.filter(
            client_id=client_id
        ).order_by('-date').first()
        
        if not latest_session:
            return {
                'is_locked': False,
                'reason': 'no_sessions',
                'has_coach': False,
                'current_risk_score': None,
                'historical_data': None
            }
        
        # Calculate current risk score
        current_risk_score = RiskAssessmentService.calculate_risk_score(latest_session)
        
        # Get historical data
        historical_data = RiskAssessmentService.get_historical_risk_data(client_id)
        
        # CONDITION 1: Current score > 65%
        is_high_risk_now = current_risk_score > RiskAssessmentService.HIGH_RISK_THRESHOLD
        
        # CONDITION 2: Historical context shows high risk
        is_historical_high_risk = False
        
        if historical_data['has_data']:
            avg_is_high = historical_data['average_score'] >= 60
            trend_is_increasing = historical_data['trend'] == 'increasing'
            
            total_sessions = len(historical_data['sessions'])
            high_risk_ratio = historical_data['high_risk_count'] / total_sessions if total_sessions > 0 else 0
            
            is_historical_high_risk = (
                avg_is_high or 
                (trend_is_increasing and current_risk_score > 50) or
                (high_risk_ratio > 0.5)
            )
        
        # MANDATORY COACHING: Both conditions must be met
        is_locked = is_high_risk_now and is_historical_high_risk
        
        reason = None
        if is_locked:
            reason = 'mandatory_coaching_required'
        elif is_high_risk_now:
            reason = 'current_high_risk_only'
        elif is_historical_high_risk:
            reason = 'historical_pattern_only'
        else:
            reason = 'low_risk'
        
        return {
            'is_locked': is_locked,
            'reason': reason,
            'has_coach': False,
            'coach_id': None,
            'current_risk_score': current_risk_score,
            'historical_data': historical_data,
            'threshold': RiskAssessmentService.HIGH_RISK_THRESHOLD,
            'conditions_met': {
                'high_risk_now': is_high_risk_now,
                'historical_high_risk': is_historical_high_risk
            }
        }
