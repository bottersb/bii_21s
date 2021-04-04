#!/bin/bash


# Segments as seen in https://research.google.com/audioset/download.html
# http://storage.googleapis.com/us_audioset/youtube_corpus/v1/csv/eval_segments.csv
#
# positive_labels can be resolved with the label indice file:
# http://storage.googleapis.com/us_audioset/youtube_corpus/v1/csv/class_labels_indices.csv
#
# Segments file content starts as follows:
# num_ytids=20371, num_segs=20371, num_unique_labels=527, num_positive_labels=51804
# YTID, start_seconds, end_seconds, positive_labels
# [...]
# -0RWZT-miFs, 420.000, 430.000, "/m/03v3yw,/m/0k4j"
#
# call should be made to:
# http://youtu.be/-0RWZT-miFs?start=420&end=430

####
#
# OPENS SEGMENT IN FIREFOX NEWTAB
#
####

[ ! -z "$firefox" ] || firefox=/cygdrive/c/Program\ Files/Mozilla\ Firefox/firefox.exe

SUFFIX=$1
START=$2
END=$3

#echo "https://youtu.be/${SUFFIX//,}?start=${START//.}&end=${END//.}"
"$firefox" --new-tab https://youtu.be/${SUFFIX//,}?start=${START//.}&end=${END//.}
