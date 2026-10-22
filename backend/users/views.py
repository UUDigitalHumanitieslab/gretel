from django.contrib.auth.models import AnonymousUser
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.request import Request

@api_view(['GET', 'POST'])
def current_user(request: Request):
    if type(request.user) is AnonymousUser:
        return Response({
            'logged_in': False
        })
    user_id = request.user.id
    username = request.user.username

    return Response({
        'logged_in': True,
        'id': user_id,
        'username': username
    })
