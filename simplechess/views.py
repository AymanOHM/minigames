from django.shortcuts import render

# Create your views here.
def chess_game(request):
    return render(request, 'simplechess/simplechess.html')