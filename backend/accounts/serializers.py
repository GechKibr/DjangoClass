from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, UserProfile, BlacklistedToken


# -------------------------
# User Registration
# -------------------------
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'password2', 'first_name', 'last_name',
            'phone_number', 'user_type', 'department', 'employee_id'
        )

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        # Only allow certain user types for public registration
        if attrs.get('user_type') not in ['public', 'investigator']:
            raise serializers.ValidationError({"user_type": "Invalid user type for public registration."})

        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


# -------------------------
# Login Serializer
# -------------------------
class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if not username or not password:
            raise serializers.ValidationError('Must include "username" and "password".')

        user = authenticate(username=username, password=password)

        if not user:
            raise serializers.ValidationError('Invalid credentials.')
        if not user.is_active:
            raise serializers.ValidationError('Account is disabled.')

        attrs['user'] = user
        return attrs


# -------------------------
# User Profile Serializer
# -------------------------
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = (
            'bio', 'profile_picture', 'address', 'date_of_birth',
            'badge_number', 'rank'
        )


# -------------------------
# User Serializer (Read-only)
# -------------------------
class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 'user_type',
            'phone_number', 'department', 'employee_id', 'is_verified',
            'date_joined', 'last_login', 'profile'
        )
        read_only_fields = ('id', 'date_joined', 'last_login', 'is_verified')


# -------------------------
# Change Password
# -------------------------
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs


# -------------------------
# User Update (Profile/Basic info)
# -------------------------
class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'phone_number', 'department')


# -------------------------
# Admin User Creation
# -------------------------
class AdminUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'first_name', 'last_name',
            'user_type', 'phone_number', 'department', 'employee_id', 'is_verified'
        )

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


# -------------------------
# Anonymous User Serializer
# -------------------------
class AnonymousUserSerializer(serializers.ModelSerializer):
    """
    Serializer for cases where a dummy anonymous user is needed internally.
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'user_type')
        read_only_fields = ('id', 'username', 'user_type')
