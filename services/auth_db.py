import os
import sqlite3
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
os.makedirs(DATA_DIR, exist_ok=True)
DB_PATH = os.path.join(DATA_DIR, 'studio_auth.db')

def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize SQLite tables for users and sessions."""
    conn = get_db()
    cur = conn.cursor()
    
    cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL COLLATE NOCASE,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            tier TEXT NOT NULL DEFAULT 'free',
            premium_expires_at TEXT,
            created_at TEXT NOT NULL,
            is_active INTEGER DEFAULT 1
        )
    ''')
    
    cur.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ''')
    conn.commit()

    # Pre-seed the exclusive Master Admin: cm5722254@gmail.com
    admin_email = "cm5722254@gmail.com"
    admin_pwd = "@Iam_Cheatm2"
    
    # Remove old placeholder admin account
    cur.execute("DELETE FROM users WHERE username = 'admin'")
    
    # Demote any other account to 'user' so only cm5722254@gmail.com is admin
    cur.execute("UPDATE users SET role = 'user' WHERE username != ? AND role = 'admin'", (admin_email,))

    cur.execute("SELECT id FROM users WHERE username = ?", (admin_email,))
    admin_row = cur.fetchone()
    salt = secrets.token_hex(16)
    pwd_hash = hash_password(admin_pwd, salt)
    now_iso = datetime.now().isoformat()

    if not admin_row:
        cur.execute('''
            INSERT INTO users (username, password_hash, salt, role, tier, created_at, is_active)
            VALUES (?, ?, ?, 'admin', 'premium', ?, 1)
        ''', (admin_email, pwd_hash, salt, now_iso))
    else:
        cur.execute('''
            UPDATE users 
            SET password_hash = ?, salt = ?, role = 'admin', tier = 'premium', is_active = 1
            WHERE username = ?
        ''', (pwd_hash, salt, admin_email))
    conn.commit()
    conn.close()

def hash_password(password: str, salt: str) -> str:
    """Hash password using PBKDF2-HMAC-SHA256 with 100,000 iterations."""
    return hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()

def verify_password(password: str, salt: str, expected_hash: str) -> bool:
    """Verify password against salt and hash."""
    return secrets.compare_digest(hash_password(password, salt), expected_hash)

def check_and_expire_subscription(user: Dict[str, Any]) -> Dict[str, Any]:
    """Auto-check if user's premium has expired. If so, revert to free tier."""
    if user.get('role') == 'admin':
        # Admin is always premium and never expires
        user['tier'] = 'premium'
        return user

    if user.get('tier') == 'premium':
        expires_at_str = user.get('premium_expires_at')
        if expires_at_str:
            try:
                expires_at = datetime.fromisoformat(expires_at_str)
                if datetime.now() >= expires_at:
                    # Subscription expired -> auto-revoke
                    conn = get_db()
                    cur = conn.cursor()
                    cur.execute('''
                        UPDATE users 
                        SET tier = 'free', premium_expires_at = NULL 
                        WHERE id = ?
                    ''', (user['id'],))
                    conn.commit()
                    conn.close()
                    user['tier'] = 'free'
                    user['premium_expires_at'] = None
            except Exception as e:
                print(f"Error checking subscription expiration: {e}")
    return user

def register_user(username: str, password: str) -> Dict[str, Any]:
    """Register a new user (defaults to Role: user, Tier: free)."""
    username = username.strip()
    if len(username) < 3:
        raise ValueError("ឈ្មោះគណនីត្រូវតែមានយ៉ាងតិច ៣ តួអក្សរ")
    if len(password) < 4:
        raise ValueError("ពាក្យសម្ងាត់ត្រូវតែមានយ៉ាងតិច ៤ តួអក្សរ")

    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE username = ?", (username,))
    if cur.fetchone():
        conn.close()
        raise ValueError("ឈ្មោះគណនីនេះត្រូវបានប្រើរួចហើយ សូមជ្រើសរើសឈ្មោះផ្សេង")

    salt = secrets.token_hex(16)
    pwd_hash = hash_password(password, salt)
    now_iso = datetime.now().isoformat()

    # All registered users are strictly regular users on the Free tier
    # (Exclusive Master Admin is cm5722254@gmail.com)
    role = 'user'
    tier = 'free'

    cur.execute('''
        INSERT INTO users (username, password_hash, salt, role, tier, created_at, is_active)
        VALUES (?, ?, ?, ?, ?, ?, 1)
    ''', (username, pwd_hash, salt, role, tier, now_iso))
    user_id = cur.lastrowid
    conn.commit()

    # Create session immediately
    token = secrets.token_hex(32)
    session_exp = (datetime.now() + timedelta(days=30)).isoformat()
    cur.execute('''
        INSERT INTO sessions (token, user_id, created_at, expires_at)
        VALUES (?, ?, ?, ?)
    ''', (token, user_id, now_iso, session_exp))
    conn.commit()
    conn.close()

    return {
        'token': token,
        'user': {
            'id': user_id,
            'username': username,
            'role': role,
            'tier': tier,
            'premium_expires_at': None,
            'created_at': now_iso
        }
    }

def login_user(username: str, password: str) -> Dict[str, Any]:
    """Authenticate user and return session token."""
    username = username.strip()
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE username = ? AND is_active = 1", (username,))
    row = cur.fetchone()
    if not row:
        conn.close()
        raise ValueError("ឈ្មោះគណនី ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ")

    user_dict = dict(row)
    if not verify_password(password, user_dict['salt'], user_dict['password_hash']):
        conn.close()
        raise ValueError("ឈ្មោះគណនី ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ")

    # Auto-expire check
    user_dict = check_and_expire_subscription(user_dict)

    # Generate session token
    token = secrets.token_hex(32)
    now_iso = datetime.now().isoformat()
    session_exp = (datetime.now() + timedelta(days=30)).isoformat()
    cur.execute('''
        INSERT INTO sessions (token, user_id, created_at, expires_at)
        VALUES (?, ?, ?, ?)
    ''', (token, user_dict['id'], now_iso, session_exp))
    conn.commit()
    conn.close()

    return {
        'token': token,
        'user': {
            'id': user_dict['id'],
            'username': user_dict['username'],
            'role': user_dict['role'],
            'tier': user_dict['tier'],
            'premium_expires_at': user_dict.get('premium_expires_at'),
            'created_at': user_dict['created_at']
        }
    }

def get_user_by_token(token: str) -> Optional[Dict[str, Any]]:
    """Retrieve and validate user from session token."""
    if not token:
        return None

    conn = get_db()
    cur = conn.cursor()
    cur.execute('''
        SELECT u.* FROM users u
        INNER JOIN sessions s ON s.user_id = u.id
        WHERE s.token = ? AND u.is_active = 1
    ''', (token,))
    row = cur.fetchone()
    conn.close()

    if not row:
        return None

    user_dict = dict(row)
    user_dict = check_and_expire_subscription(user_dict)
    
    # Do not expose hash and salt
    user_dict.pop('password_hash', None)
    user_dict.pop('salt', None)
    return user_dict

def logout_user(token: str):
    """Delete session token."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM sessions WHERE token = ?", (token,))
    conn.commit()
    conn.close()

# --- Admin Management Functions ---

def list_all_users() -> List[Dict[str, Any]]:
    """List all registered users for Admin panel."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, username, role, tier, premium_expires_at, created_at, is_active FROM users ORDER BY id DESC")
    rows = cur.fetchall()
    conn.close()

    users = []
    for r in rows:
        u = dict(r)
        u = check_and_expire_subscription(u)
        users.append(u)
    return users

def set_user_premium(user_id: int, days: int) -> Dict[str, Any]:
    """Grant Premium tier to a user with specific duration in days (or -1 for lifetime)."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        raise ValueError("រកមិនឃើញគណនីនេះទេ")

    if days == -1:
        # Lifetime
        expires_at_iso = None
    else:
        # If user is already premium with future expiration, add days to it
        current_exp = row['premium_expires_at']
        if current_exp and row['tier'] == 'premium':
            try:
                base_dt = max(datetime.now(), datetime.fromisoformat(current_exp))
            except Exception:
                base_dt = datetime.now()
        else:
            base_dt = datetime.now()
        expires_at_iso = (base_dt + timedelta(days=days)).isoformat()

    cur.execute('''
        UPDATE users 
        SET tier = 'premium', premium_expires_at = ? 
        WHERE id = ?
    ''', (expires_at_iso, user_id))
    conn.commit()
    conn.close()

    return {
        'id': user_id,
        'tier': 'premium',
        'premium_expires_at': expires_at_iso
    }

def revoke_user_premium(user_id: int) -> Dict[str, Any]:
    """Downgrade a user back to Free tier."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute('''
        UPDATE users 
        SET tier = 'free', premium_expires_at = NULL 
        WHERE id = ?
    ''', (user_id,))
    conn.commit()
    conn.close()
    return {'id': user_id, 'tier': 'free', 'premium_expires_at': None}

def delete_user(user_id: int):
    """Delete a user account."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()

# Auto-initialize DB tables on module import
init_db()
