#!/bin/bash
javac YTDL.java
jar -cfe YTDL.jar YTDL YTDL.class
rm YTDL.class
java -jar YTDL.jar $@

