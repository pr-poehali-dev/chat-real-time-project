import json
import os
import psycopg2
from datetime import datetime

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    '''API для работы с мессенджером в реальном времени'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        if action == 'register':
            phone_number = body.get('phoneNumber')
            username = body.get('username')
            display_name = body.get('displayName')
            promo_code = body.get('promoCode', '')
            
            is_developer = promo_code == 'super123q'
            
            cur.execute(
                "INSERT INTO users (phone_number, username, display_name, is_developer) VALUES (%s, %s, %s, %s) RETURNING id",
                (phone_number, username, display_name, is_developer)
            )
            user_id = cur.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'userId': user_id, 'isDeveloper': is_developer}),
                'isBase64Encoded': False
            }
        
        elif action == 'getUser':
            user_id = body.get('userId')
            
            cur.execute(
                "SELECT id, phone_number, username, display_name, avatar_url, is_developer FROM users WHERE id = %s",
                (user_id,)
            )
            user = cur.fetchone()
            
            if user:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'id': user[0],
                        'phoneNumber': user[1],
                        'username': user[2],
                        'displayName': user[3],
                        'avatarUrl': user[4],
                        'isDeveloper': user[5]
                    }),
                    'isBase64Encoded': False
                }
        
        elif action == 'searchUser':
            query = body.get('query')
            
            cur.execute(
                "SELECT id, phone_number, username, display_name, avatar_url FROM users WHERE phone_number = %s OR username = %s LIMIT 10",
                (query, query)
            )
            users = cur.fetchall()
            
            result = [{
                'id': u[0],
                'phoneNumber': u[1],
                'username': u[2],
                'displayName': u[3],
                'avatarUrl': u[4]
            } for u in users]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif action == 'getOrCreateChat':
            user1_id = body.get('user1Id')
            user2_id = body.get('user2Id')
            
            if user1_id > user2_id:
                user1_id, user2_id = user2_id, user1_id
            
            cur.execute(
                "SELECT id FROM chats WHERE user1_id = %s AND user2_id = %s",
                (user1_id, user2_id)
            )
            chat = cur.fetchone()
            
            if chat:
                chat_id = chat[0]
            else:
                cur.execute(
                    "INSERT INTO chats (user1_id, user2_id) VALUES (%s, %s) RETURNING id",
                    (user1_id, user2_id)
                )
                chat_id = cur.fetchone()[0]
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'chatId': chat_id}),
                'isBase64Encoded': False
            }
        
        elif action == 'sendMessage':
            chat_id = body.get('chatId')
            sender_id = body.get('senderId')
            message_text = body.get('messageText')
            
            cur.execute(
                "INSERT INTO messages (chat_id, sender_id, message_text) VALUES (%s, %s, %s) RETURNING id, created_at",
                (chat_id, sender_id, message_text)
            )
            msg = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'messageId': msg[0],
                    'createdAt': msg[1].isoformat()
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'getMessages':
            chat_id = body.get('chatId')
            
            cur.execute(
                "SELECT id, sender_id, message_text, created_at FROM messages WHERE chat_id = %s ORDER BY created_at ASC",
                (chat_id,)
            )
            messages = cur.fetchall()
            
            result = [{
                'id': str(m[0]),
                'senderId': m[1],
                'text': m[2],
                'time': m[3].strftime('%H:%M')
            } for m in messages]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        elif action == 'getChats':
            user_id = body.get('userId')
            
            cur.execute("""
                SELECT DISTINCT c.id, 
                    CASE WHEN c.user1_id = %s THEN u2.id ELSE u1.id END as other_user_id,
                    CASE WHEN c.user1_id = %s THEN u2.display_name ELSE u1.display_name END as other_name,
                    CASE WHEN c.user1_id = %s THEN u2.username ELSE u1.username END as other_username,
                    CASE WHEN c.user1_id = %s THEN u2.avatar_url ELSE u1.avatar_url END as other_avatar,
                    m.message_text as last_message,
                    m.created_at as last_message_time
                FROM chats c
                JOIN users u1 ON c.user1_id = u1.id
                JOIN users u2 ON c.user2_id = u2.id
                LEFT JOIN LATERAL (
                    SELECT message_text, created_at 
                    FROM messages 
                    WHERE chat_id = c.id 
                    ORDER BY created_at DESC 
                    LIMIT 1
                ) m ON TRUE
                WHERE c.user1_id = %s OR c.user2_id = %s
                ORDER BY m.created_at DESC NULLS LAST
            """, (user_id, user_id, user_id, user_id, user_id, user_id))
            
            chats = cur.fetchall()
            
            result = [{
                'id': str(c[0]),
                'userId': c[1],
                'name': c[2],
                'username': c[3],
                'avatar': c[4] or '',
                'lastMessage': c[5] or '',
                'time': c[6].strftime('%H:%M') if c[6] else '',
                'unread': 0,
                'online': False
            } for c in chats]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid action'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
