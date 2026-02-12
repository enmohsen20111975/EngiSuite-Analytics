"""
Migration script to add profile_data and preferences columns to users table
Run this script to update the database schema
"""

from sqlalchemy import create_engine, text, Column, JSON
from database import engine, Base
from config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def migrate():
    """Add profile_data and preferences columns to users table"""
    
    try:
        with engine.connect() as conn:
            # Check if columns already exist
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                AND column_name IN ('profile_data', 'preferences')
            """))
            
            existing_columns = [row[0] for row in result]
            
            # Add profile_data column if not exists
            if 'profile_data' not in existing_columns:
                logger.info("Adding profile_data column...")
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN profile_data JSON
                """))
                conn.commit()
                logger.info("profile_data column added successfully")
            else:
                logger.info("profile_data column already exists")
            
            # Add preferences column if not exists
            if 'preferences' not in existing_columns:
                logger.info("Adding preferences column...")
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN preferences JSON
                """))
                conn.commit()
                logger.info("preferences column added successfully")
            else:
                logger.info("preferences column already exists")
            
            logger.info("Migration completed successfully!")
            
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        raise


def rollback():
    """Remove profile_data and preferences columns from users table"""
    
    try:
        with engine.connect() as conn:
            # Drop preferences column
            logger.info("Dropping preferences column...")
            conn.execute(text("""
                ALTER TABLE users 
                DROP COLUMN IF EXISTS preferences
            """))
            
            # Drop profile_data column
            logger.info("Dropping profile_data column...")
            conn.execute(text("""
                ALTER TABLE users 
                DROP COLUMN IF EXISTS profile_data
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
