#!/bin/bash
javac YTDL.java
jar -cfe YTDL.jar YTDL *.class
rm *.class
java -jar YTDL.jar $@

