package at.ac.tuwien.bii;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.*;

public class YTDL {

    static final int VIDEO_LIMIT = 10;
    static final int LINE_LIMIT = 10000;
    static final String YT_BASE_URL = "http://www.youtube.com/watch?v=";
    static final String AUDIOSET_BASE_DIR = "D:\\bottersb\\Code\\YTDL\\data\\AudioSet\\";

    static Map<String, String> fileMap;

    static {
        fileMap = new HashMap<>();
        fileMap.put("EVAL", AUDIOSET_BASE_DIR + "eval_segments.csv");
        fileMap.put("LABELS", AUDIOSET_BASE_DIR + "class_labels_indices.csv");
        fileMap.put("BALANCED", AUDIOSET_BASE_DIR + "balanced_train_segments.csv");
        fileMap.put("UNBALANCED", AUDIOSET_BASE_DIR + "unbalanced_train_segments.csv");
    }

    static int allCounter = 0;

    static class Video {
        public String name;
        public String url;
        public Integer start;
        public Integer duration;
        public String type;

        Video(String urlPart, String start, String end, String type) {
            this.name = urlPart + ".wav";
            this.url = YT_BASE_URL + urlPart;
            this.start = Integer.valueOf(start.trim().split("\\.")[0]);
            this.duration = Integer.valueOf(end.trim().split("\\.")[0]) - this.start;
            this.type = type;
        }

        public void downLoad() {
            //TODO
        }

        @Override
        public String toString() {
            return "{\"type\":\"" + this.type + "\", \"url\":\"" + this.url + "\", \"start\":\"" + this.start + "\", \"duration\":\"" + this.duration + "\", \"name\":\"" + this.name + "\"}";
        }
    }

    static class Animal {
        public String name;
        public String nameId;
        public String sound;
        public String soundId;
        public Map<String, List<Video>> videos;
        private int count = 0;

        Animal(String name, String nameId, String sound, String soundId) {
            this.videos = new HashMap<>();
            this.videos.put("EVAL", new ArrayList<>());
            this.videos.put("BALANCED", new ArrayList<>());
            this.videos.put("UNBALANCED", new ArrayList<>());
            this.name = name;
            this.nameId = nameId;
            this.sound = sound;
            this.soundId = soundId;
        }

        public void addVideo(Video v) {
            if (isFull(v.type)) {
                return;
            }
            List<Video> vids = this.videos.get(v.type);
            if (vids != null) {
                if (vids.size() < VIDEO_LIMIT) {
                    vids.add(v);
                    increment();
                }
            }
        }

        public boolean isFull(String type) {
            if (type == null || type == "ALL") {
                return videos.get("EVAL").size() >= VIDEO_LIMIT &&
                        videos.get("BALANCED").size() >= VIDEO_LIMIT &&
                        videos.get("UNBALANCED").size() >= VIDEO_LIMIT;
            } else {
                return videos.get(type).size() >= VIDEO_LIMIT;
            }
        }

        private void increment() {
            allCounter++;
        }
    }

    static Animal[] animals = new Animal[]{
            new Animal("Dog", "/m/0bt9lr", "Bark", "/m/05tny_"),
            new Animal("Cat", "/m/01yrx", "Meow", "/m/07qrkrw"),
            new Animal("Cattle", "/m/01xq0k1", "Moo", "/m/07rpkh9"),
            new Animal("Pig", "/m/068zj", "Oink", "/t/dd00018"),
            new Animal("Goat", "/m/03fwl", "Bleat", "/m/07q0h5t"),
            new Animal("Turkey", "/m/01rd7k", "Gobble", "/m/07svc2k"),
            new Animal("Duck", "/m/09ddx", "Quack", "/m/07qdb04"),
            new Animal("Owl", "/m/09d5_", "Hoot", "/m/07r_80w"),
            new Animal("Frog", "/m/09ld4", "Croak", "/m/07st88b")
    };
    static Animal noAnimal = new Animal("None", "", "", "");

    private static boolean areWeDoneYet(String type) {
        for (Animal a : animals) {
            if (!a.isFull(type)) {
                return false;
            }
        }
        if (!noAnimal.isFull(type)) {
            return false;
        }
        return true;
    }

    public static void parseLine(String line, String type) {
        List<String> parts = Arrays.asList(line.replace('"', ' ').split(","));
        if (parts.size() < 5) {
            return;
        }

        Video v = new Video(parts.get(0).trim(), parts.get(1).trim(), parts.get(2).trim(), type);

        for (Animal a : animals) {
            if (parts.containsAll(Arrays.asList(a.nameId, a.soundId))) {
                a.addVideo(v);
                return;
            }
        }

        noAnimal.addVideo(v);
    }

    public static void main(String[] args) {
        BufferedReader reader;

        int i = 0, limit = LINE_LIMIT;
        String[] types = new String[]{"EVAL", "BALANCED", "UNBALANCED"};
        try {
            for (String type : types) {
                reader = new BufferedReader(new FileReader(fileMap.get(type)));

                // skip headers
                int header = 3;
                while (0 < header--) {
                    reader.readLine();
                }

                String line;
                while ((line = reader.readLine()) != null && i < limit) {
                    if (areWeDoneYet(type)) {
                        break;
                    }
                    parseLine(line, type);
                    i++;
                }
                reader.close();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        for (String type : types) {
            for (Animal a : animals) {
                System.out.println("\"" + a.name + "\": [");
                boolean first = true;
                for (Video v : a.videos.get(type)) {
                    if (!first) {
                        System.out.println(",");
                    }
                    first = false;
                    System.out.print(v);
                }
                System.out.println("\n],");
            }
        }
    }
}


