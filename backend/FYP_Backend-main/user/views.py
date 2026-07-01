from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

# Using 'UserModel' as an alias to avoid conflict with the local 'user' variable
from .models import user as UserModel 
from .serializers import UserSerializer

@api_view(['GET', 'POST'])
@permission_classes([AllowAny]) # Allows React to Signup without a Token
def user_list_create(request):
    """
    List all users or create a new user.
    """
    if request.method == 'GET':
        users = UserModel.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            # Save the new user
            new_user = serializer.save()
            
            # AUTO-CREATE profile based on role
            if new_user.role and new_user.role.lower() == 'coach':
                from human_coach.models import human_coach
                try:
                    human_coach.objects.create(
                        user_id=new_user,
                        full_name=new_user.name or f"Coach{new_user.user_id}",
                        specialization=request.data.get('specialization', 'Not specified'),
                        license_id=request.data.get('license_id') or None,
                    )
                    print(f"[Signup] Auto-created coach profile for user {new_user.user_id}")
                except Exception as e:
                    print(f"[Signup ERROR] Failed to create coach profile: {e}")
            else:
                from client.models import client
                try:
                    client_profile = client.objects.create(
                        user_id=new_user,
                        name=new_user.name or f"User{new_user.user_id}",
                        age=25,
                        gender='Not specified',
                        email=new_user.email
                    )
                    print(f"[Signup] Auto-created client profile for user {new_user.user_id}: client_id={client_profile.client_id}")
                except Exception as e:
                    print(f"[Signup ERROR] Failed to create client profile: {e}")
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        # If data is invalid (e.g. missing email), return the specific errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    """
    Login user with email and password validation.
    Returns user data along with their client_id if they have a client profile.
    """
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response(
            {"error": "Email and password are required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = UserModel.objects.get(email=email)
        
        # Check password
        if user.password == password:  # In production, use hashed passwords
            serializer = UserSerializer(user)
            user_data = serializer.data
            
            # Return profile data based on role
            if user.role and user.role.lower() == 'coach':
                from human_coach.models import human_coach
                try:
                    coach_profile = human_coach.objects.get(user_id=user.user_id)
                    user_data['coach_id'] = coach_profile.coach_id
                    user_data['is_approved'] = coach_profile.is_approved
                    user_data['id'] = coach_profile.coach_id
                    print(f"[Login] Coach {user.user_id} logged in with coach_id: {coach_profile.coach_id}")
                except human_coach.DoesNotExist:
                    user_data['coach_id'] = None
                    user_data['is_approved'] = False
                    user_data['id'] = user.user_id
            else:
                from client.models import client
                try:
                    client_profile = client.objects.get(user_id=user.user_id)
                    user_data['id'] = client_profile.client_id
                    user_data['client_id'] = client_profile.client_id
                    user_data['client_name'] = client_profile.name
                    print(f"[Login] User {user.user_id} ({user.email}) logged in with client_id: {client_profile.client_id}")
                except client.DoesNotExist:
                    print(f"[Login] User {user.user_id} ({user.email}) has no client profile - creating one...")
                    try:
                        client_profile = client.objects.create(
                            user_id=user,
                            name=user.name or f"User{user.user_id}",
                            age=25,
                            gender='Not specified',
                            email=user.email
                        )
                        user_data['id'] = client_profile.client_id
                        user_data['client_id'] = client_profile.client_id
                        user_data['client_name'] = client_profile.name
                        print(f"[Login] Auto-created client profile: client_id={client_profile.client_id}")
                    except Exception as e:
                        print(f"[Login ERROR] Failed to create client profile: {e}")
                        user_data['id'] = user.user_id
                        user_data['client_id'] = None
            
            return Response(user_data, status=status.HTTP_200_OK)
        else:
            return Response(
                {"error": "Invalid password"},
                status=status.HTTP_401_UNAUTHORIZED
            )
    except UserModel.DoesNotExist:
        return Response(
            {"error": "User not found. Please sign up first."},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny]) # Also set to AllowAny for testing; change to IsAuthenticated later
def user_detail(request, pk):
    """
    Retrieve, update or delete a specific user.
    """
    # Renamed variable to 'user_instance' to avoid hiding the UserModel
    user_instance = get_object_or_404(UserModel, pk=pk)

    if request.method == 'GET':
        serializer = UserSerializer(user_instance)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = UserSerializer(user_instance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        user_instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)