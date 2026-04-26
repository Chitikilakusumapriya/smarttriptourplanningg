from flask import Blueprint, request, jsonify
from utils.db import db
from models.user import User
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from datetime import timedelta

bcrypt = Bcrypt()
auth_bp = Blueprint('auth_bp', __name__)
jwt = JWTManager()

# ---------- Register ----------
@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Email already exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(
        name=data['name'],
        email=data['email'],
        password=hashed_pw,
        phone=data.get('phone'),
        role=data['role']
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully",
        "user": {
            "id": str(new_user.id),
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role
        }
    }), 201

# ---------- Login (with role validation) ----------
@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')  # <-- role from request

    user = User.query.filter_by(email=email).first()

    # Validate email, password, and role
    if not user or not bcrypt.check_password_hash(user.password, password) or user.role != role:
        return jsonify({"message": "Invalid credentials or role"}), 401

    access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(hours=1))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        "accessToken": access_token,
        "refreshToken": refresh_token,
        "user": {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }), 200

# ---------- Get Current User ----------
@auth_bp.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "role": user.role
    })

# ---------- Refresh Token ----------
@auth_bp.route('/api/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=str(user_id), expires_delta=timedelta(hours=1))
    return jsonify({"accessToken": new_access_token})

# ---------- Update Profile ----------
@auth_bp.route('/api/users/<id>', methods=['PUT'])
@jwt_required()
def update_user(id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if str(user.id) != id:
        return jsonify({"message": "Unauthorized"}), 403

    data = request.get_json()
    user.name = data.get('name', user.name)
    user.phone = data.get('phone', user.phone)
    db.session.commit()

    return jsonify({
        "message": "Profile updated successfully",
        "user": {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "phone": user.phone
        }
    })

# ---------- Get All Users (Admin Only) ----------
@auth_bp.route('/api/users', methods=['GET'])
@jwt_required()
def get_all_users():
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)
    if current_user.role != "ADMIN":
        return jsonify({"message": "Access denied"}), 403

    users = User.query.all()
    return jsonify([{"id": str(u.id), "name": u.name, "role": u.role} for u in users])
