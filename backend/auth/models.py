from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    """
    User model - contains all user-related data
    This database is separate from the workflow database which contains equations and workflows
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    google_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    picture = Column(String, nullable=True)
    given_name = Column(String, nullable=True)
    family_name = Column(String, nullable=True)
    locale = Column(String, nullable=True)
    
    # Subscription and credits
    tier = Column(String, default="free")  # free, basic, pro, enterprise
    credits_remaining = Column(Integer, default=100)
    subscription_status = Column(String, default="active")  # active, inactive, cancelled, expired
    subscription_start_date = Column(DateTime(timezone=True), nullable=True)
    subscription_end_date = Column(DateTime(timezone=True), nullable=True)
    
    # User status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Login tracking
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    login_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Profile data for reports (stored as JSON)
    profile_data = Column(JSON, nullable=True)  # {job_title, company, phone, license, specialization, address, city, country, signature_url}
    
    # User preferences (stored as JSON)
    preferences = Column(JSON, nullable=True)  # {theme, color_theme, language, font_size, reduced_motion, notifications}
    
    # Relationships
    calculation_history = relationship("CalculationHistory", back_populates="user", cascade="all, delete-orphan")
    workflow_history = relationship("WorkflowHistory", back_populates="user", cascade="all, delete-orphan")
    subscription_history = relationship("SubscriptionHistory", back_populates="user", cascade="all, delete-orphan")


class CalculationHistory(Base):
    """
    Track user's calculation history
    """
    __tablename__ = "calculation_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Calculation details
    equation_id = Column(String, index=True, nullable=False)  # Reference to equation in workflow database
    equation_name = Column(String, nullable=True)
    domain = Column(String, nullable=True)  # civil, electrical, mechanical
    
    # Input and output data
    input_values = Column(JSON, nullable=True)  # Store input parameters
    output_values = Column(JSON, nullable=True)  # Store calculation results
    
    # Metadata
    calculation_time = Column(Float, nullable=True)  # Time taken in seconds
    credits_used = Column(Integer, default=1)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    user = relationship("User", back_populates="calculation_history")


class WorkflowHistory(Base):
    """
    Track user's workflow execution history
    """
    __tablename__ = "workflow_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Workflow details
    workflow_id = Column(String, index=True, nullable=False)  # Reference to workflow in workflow database
    workflow_title = Column(String, nullable=True)
    domain = Column(String, nullable=True)  # civil, electrical, mechanical
    
    # Input and output data
    input_values = Column(JSON, nullable=True)  # Store input parameters
    output_values = Column(JSON, nullable=True)  # Store workflow results
    
    # Execution status
    status = Column(String, default="completed")  # completed, failed, cancelled
    error_message = Column(Text, nullable=True)
    
    # Metadata
    execution_time = Column(Float, nullable=True)  # Time taken in seconds
    credits_used = Column(Integer, default=1)
    
    # Timestamps
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationship
    user = relationship("User", back_populates="workflow_history")


class SubscriptionHistory(Base):
    """
    Track user's subscription changes
    """
    __tablename__ = "subscription_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Subscription details
    old_tier = Column(String, nullable=True)
    new_tier = Column(String, nullable=True)
    action = Column(String, nullable=False)  # upgrade, downgrade, renew, cancel
    
    # Payment details (if applicable)
    payment_method = Column(String, nullable=True)
    amount = Column(Float, nullable=True)
    currency = Column(String, default="USD")
    payment_id = Column(String, nullable=True)
    
    # Subscription period
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    user = relationship("User", back_populates="subscription_history")