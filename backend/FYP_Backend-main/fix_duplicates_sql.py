import os
import sqlite3

# Connect to the database
db_path = 'db.sqlite3'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("=" * 70)
print("FIXING DUPLICATE COACHES - DIRECT SQL APPROACH")
print("=" * 70)

# Find duplicates
cursor.execute("""
    SELECT user_id_id, COUNT(*) as count
    FROM human_coach_human_coach
    GROUP BY user_id_id
    HAVING COUNT(*) > 1
""")

duplicates = cursor.fetchall()

if duplicates:
    print(f"\n❌ Found {len(duplicates)} duplicate user_id entries:")
    
    for user_id, count in duplicates:
        print(f"\n   User ID {user_id}: {count} coaches")
        
        # Get all coach_ids for this user_id
        cursor.execute("""
            SELECT coach_id FROM human_coach_human_coach
            WHERE user_id_id = ?
            ORDER BY coach_id ASC
        """, (user_id,))
        
        coach_ids = [row[0] for row in cursor.fetchall()]
        keep_id = coach_ids[0]
        delete_ids = coach_ids[1:]
        
        print(f"   Keeping: Coach ID {keep_id}")
        print(f"   Deleting: Coach IDs {delete_ids}")
        
        # Delete duplicates directly
        for del_id in delete_ids:
            cursor.execute("""
                DELETE FROM human_coach_human_coach
                WHERE coach_id = ?
            """, (del_id,))
            print(f"   ✓ Deleted Coach ID {del_id}")
    
    # Commit changes
    conn.commit()
    
    print("\n" + "=" * 70)
    print("✅ DUPLICATES REMOVED!")
    print("=" * 70)
    print("\nNow run: python manage.py migrate human_coach")

else:
    print("\n✅ No duplicate user_id entries found!")
    print("=" * 70)

conn.close()
