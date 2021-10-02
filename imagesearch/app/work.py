import os
import cv2
import numpy as np
import csv

class ColorDescriptor:
	def __init__(self, bins):
		# store the number of bins for the 3D histogram
		self.bins = bins

	def describe(self, image):
		# convert the image to the HSV color space and initialize
		# the features used to quantify the image
		image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
		features = []

		# grab the dimensions and compute the center of the image
		(h, w) = image.shape[:2]
		(cX, cY) = (int(w * 0.5), int(h * 0.5))

		# divide the image into four rectangles/segments (top-left,
		# top-right, bottom-right, bottom-left)
		segments = [(0, cX, 0, cY), (cX, w, 0, cY), (cX, w, cY, h),
			(0, cX, cY, h)]
 
		# construct an elliptical mask representing the center of the
		# image
		(axesX, axesY) = (int(w * 0.75) // 2, int(h * 0.75) // 2)
		ellipMask = np.zeros(image.shape[:2], dtype = "uint8")
		cv2.ellipse(ellipMask, (cX, cY), (axesX, axesY), 0, 0, 360, 255, -1)
 
		# loop over the segments
		for (startX, endX, startY, endY) in segments:
			# construct a mask for each corner of the image, subtracting
			# the elliptical center from it
			cornerMask = np.zeros(image.shape[:2], dtype = "uint8")
			cv2.rectangle(cornerMask, (startX, startY), (endX, endY), 255, -1)
			cornerMask = cv2.subtract(cornerMask, ellipMask)
 
			# extract a color histogram from the image, then update the
			# feature vector
			hist = self.histogram(image, cornerMask)
			features.extend(hist)
 
		# extract a color histogram from the elliptical region and
		# update the feature vector
		hist = self.histogram(image, ellipMask)
		features.extend(hist)
 
		# return the feature vector
		return features

	def histogram(self, image, mask):
		# extract a 3D color histogram from the masked region of the
		# image, using the supplied number of bins per channel; then
		# normalize the histogram
		hist = cv2.calcHist([image], [0, 1, 2], mask, self.bins,
			[0, 180, 0, 256, 0, 256])
		cv2.normalize(hist,hist)
		hist = hist.flatten()
 
		# return the histogram
		return hist

class Searcher:
	def __init__(self, indexPath):
		#store our index path
		self.indexPath = indexPath

	def search(self, queryFeatures, limit=101):
		#initialize dictionary of results
		results = {}

		#open the index file
		with open(self.indexPath) as f:
			#initialize the CSV reader
			reader = csv.reader(f)

			#loop over the rows in the index
			for row in reader:
				#parse out the image ID and features, then compute the
				#chi-squared dist. b/w the features in our index
				#and our query features
				features = [float(x) for x in row[1:]]
				d = self.chi2_distance(features, queryFeatures)

				#Update dictionsary
				#key is image id, value is similarity
				results[row[0]] = d

			#close reader
			f.close()

		#sort in order of relevance
		results = sorted([(v,k) for (k,v) in results.items()])

		#return our (limited) results
		return results[:limit]

	def chi2_distance(self, histA, histB, eps=1e-10):
		#compute chi-squared distance
		d = 0.5 * np.sum([((a-b)**2)/(a+b+eps)
			for (a,b) in zip(histA, histB)])

		# return the chi-squared distance
		return d
