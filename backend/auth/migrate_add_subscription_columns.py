"""
Migration script to add missing columns to users table
Run this script to update the database schema

Missing columns that will be added:
- subscription_status
- subscription_start_date
- subscription_end_date
- is_verified
- profile_data
- preferences
"""

from sqlalchemy import create_engine, text
from database import engine
from config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_existing_columns(conn, table_name):
    """Get existing columns for SQLite using PRAGMA"""
    result = conn.execute(text(f"PRAGMA table_info({table_name})"))
    return [row[1] for row in result]  # row[1] is the column name


def migrate():
    """Add missing columns to users table"""
    
    try:
        with engine.connect() as conn:
            # Get existing columns using SQLite PRAGMA
            existing_columns = get_existing_columns(conn, 'users')
            logger.info(f"Existing columns in users table: {existing_columns}")
            
            # Define all required columns with their SQL definitions
            required_columns = {
                'subscription_status': "VARCHAR(50) DEFAULT 'active'",
                'subscription_start_date': "TIMESTAMP",
                'subscription_end_date': "TIMESTAMP",
                'is_verified': "BOOLEAN DEFAULT 0",
                'profile_data': "JSON",
                'preferences': "JSON",
            }
            
            # Add each missing column
            for column_name, column_def in required_columns.items():
                if column_name not in existing_columns:
                    logger.info(f"Adding {column_name} column...")
                    try:
                        conn.execute(text(f"""
                            ALTER TABLE users 
                            ADD COLUMN {column_name} {column_def}
                        """))
                        conn.commit()
                        logger.info(f"{column_name} column added successfully")
                    except Exception as e:
                        # SQLite doesn't support IF NOT EXISTS for ALTER TABLE
                        if "duplicate column name" in str(e).lower():
                            logger.info(f"{column_name} column already exists")
                        else:
                            raise
                else:
                    logger.info(f"{column_name} column already exists")
            
            logger.info("Migration completed successfully!")
            
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        raise


def rollback():
    """Remove subscription columns from users table"""
    
    try:
        with engine.connect() as conn:
            # Drop subscription_end_date column
            logger.info("Dropping subscription_end_date column...")
            conn.execute(text("""
                ALTER TABLE users 
                DROP COLUMN IF EXISTS subscription_end_date
            """))
            
            # Drop subscription_start_date column
            logger.info("Dropping subscription_start_date column...")
            conn.execute(text("""
                ALTER TABLE users 
                DROP COLUMN IF EXISTS subscription_start_date
            """))
            
            # Drop subscription_status column
            logger.info("Dropping subscription_status column...")
            conn.execute(text("""
                ALTER TABLE users 
                DROP COLUMN IF EXISTS subscription_status
            """))
            
            conn.commit()
            logger.info("Rollback completed successfully!")
            
    except Exception as e:
        logger.error(f"Rollback failed: {e}")
        raise


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--rollback":
        rollback()
    else:
        migrate()
