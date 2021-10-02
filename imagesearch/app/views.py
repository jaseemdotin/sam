from django.shortcuts import render
from django.http import JsonResponse
from .models import sampletb
from skimage import io
import cv2
from django.views.decorators.csrf import csrf_exempt
from .work import *


@csrf_exempt
def resultView(request):
	RESULTS_ARRAY = []
	if request.method == "POST":
		image = request.FILES.get('image')
		limit = int(request.POST.get('limit'))
		min = int(request.POST.get('min'))
		max = int(request.POST.get('max'))
		try:
			data = sampletb.objects.latest('id')
		except:
			data = sampletb.objects.create(image=image)
		data.image=image
		data.save()
		image_url = data.image.path
		cd = ColorDescriptor((8, 12, 3))
		query = cv2.imread(image_url)
		features = cd.describe(query)
		INDEX = r"../app/index.csv"
		searcher = Searcher(INDEX)
		results = searcher.search(features)
		for (score, resultID) in results:
			if score<max and score>min:
				RESULTS_ARRAY.append({"image": str(resultID), "score": str(score),"ogimg":data.image.url})
		if len(RESULTS_ARRAY)==0:
			return JsonResponse([{"valid":1,"ogimg":data.image.url}],safe=False)
		else:
			return JsonResponse(RESULTS_ARRAY[:limit],safe=False)
	return JsonResponse([1],safe=False)

def homeView(request):
	return render(request,'home.html')