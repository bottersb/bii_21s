import java.io.*;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class YTDL {

    enum Types {EVAL, BALANCED, UNBALANCED}

    static final List<String> TYPES_LIST = Stream.of(Types.values())
            .map(Enum::name)
            .collect(Collectors.toList());

    static final int VIDEO_LIMIT = 10;
    // for dry run purposes:
    //static final int LINE_LIMIT = 1000;
    static final int LINE_LIMIT = Integer.MAX_VALUE;
    static final int MAX_THREADS = 3;
    static final String YT_BASE_URL = "http://www.youtube.com/watch?v=";
    static final String AUDIOSET_BASE_DIR = "D:\\bottersb\\Code\\YTDL\\data\\AudioSet\\";
    static final String AUDIO_OUTPUTDIR = "D:\\bottersb\\Code\\YTDL\\data\\audio\\";
    static final String YTDL_PATH = "D:\\bottersb\\Uni\\TUWIEN\\21S\\BII\\project\\util\\youtube-dl.exe";
    static final String FFMPEG_PATH = "ffmpeg";
    static final String OUT_FORMAT = "mp3";
    static final String AUDIO_CODEC = "libmp3lame";

    static ExecutorService terminator = Executors.newFixedThreadPool(MAX_THREADS);
    static Map<String, String> fileMap;
    static {
        fileMap = new HashMap<>();
        fileMap.put(Types.EVAL.name(), AUDIOSET_BASE_DIR + "eval_segments.csv");
        fileMap.put("LABELS", AUDIOSET_BASE_DIR + "class_labels_indices.csv");
        fileMap.put(Types.BALANCED.name(), AUDIOSET_BASE_DIR + "balanced_train_segments.csv");
        fileMap.put(Types.UNBALANCED.name(), AUDIOSET_BASE_DIR + "unbalanced_train_segments.csv");
    }

    static int allCounter = 0;

    static class Video implements Runnable {
        public String name;
        public String url;
        public Integer start;
        public Integer duration;
        public String type;
        public String animal;

        Video(String urlPart, String start, String end, String type, String animal) {
            //this.name = urlPart + ".mp4";
            this.name = urlPart + "." + OUT_FORMAT;
            this.url = YT_BASE_URL + urlPart;
            this.start = Integer.valueOf(start.trim().split("\\.")[0]);
            this.duration = Integer.valueOf(end.trim().split("\\.")[0]) - this.start;
            this.type = type;
            this.animal = animal;
        }

        @Override
        public void run() {
            try {
                get();
            } catch (IOException | InterruptedException e) {
                e.printStackTrace();
            }
        }

        public void get() throws IOException, InterruptedException {
            String audioUrl = getDLUrl();
            if (audioUrl != null) {
                dlFile();
                cutAudio();
                deleteUncut();
            }
        }

        private void dlFile() throws IOException, InterruptedException {
            String[] params = {YTDL_PATH, "-f", "bestaudio", "--extract-audio", "--audio-format", OUT_FORMAT, url , "-o", "\"" + AUDIO_OUTPUTDIR+name + "\""};
            runProcess(params);
        }

        private void cutAudio() throws IOException, InterruptedException {
            String[] params = {FFMPEG_PATH, "-i", "\"" + AUDIO_OUTPUTDIR+name + "\"", "-ss", start.toString(), "-t", duration.toString(), "-vn", "-c:a", AUDIO_CODEC, "\"" + AUDIO_OUTPUTDIR+type + "_" + animal + "_" +name + "\"" };
            runProcess(params);
        }

        private void runProcess(String[] params) throws IOException, InterruptedException {
            System.out.println(String.join(", ", params));
            Process p = Runtime.getRuntime().exec(params);
            BufferedReader bri = new BufferedReader(new InputStreamReader(p.getInputStream()));
            BufferedReader bre = new BufferedReader(new InputStreamReader(p.getErrorStream()));
            String line;
            while ((line = bri.readLine()) != null) {
                System.out.println(line);
            }
            bri.close();

            String errLine;
            while ((errLine = bre.readLine()) != null) {
                System.out.println(errLine);
            }
            bre.close();
            p.waitFor();
        }

        private void deleteUncut(){
            File uncut = new File(AUDIO_OUTPUTDIR+name);
            if (!uncut.delete()) {
                System.out.println("Failed to delete file: " + uncut.getName());
            }
        }

        private String getDLUrl() throws IOException, InterruptedException {
            // remove duplicate parts, adjust runProcess for process output return
            String[] params = {YTDL_PATH, "-g", url};
            Process p = Runtime.getRuntime().exec(params);
            BufferedReader bri = new BufferedReader(new InputStreamReader(p.getInputStream()));
            BufferedReader bre = new BufferedReader(new InputStreamReader(p.getErrorStream()));
            List<String> avUrls = new ArrayList<>();
            String line;
            while ((line = bri.readLine()) != null) {
                avUrls.add(line);
            }
            bri.close();
            String errLine;
            while ((errLine = bre.readLine()) != null) {
                System.out.println(errLine);
            }

            bre.close();
            p.waitFor();
            if(avUrls.size() >= 2){
                return avUrls.get(1);
            } else {
                return null;
            }
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
            this.videos.put(Types.EVAL.name(), new ArrayList<>());
            this.videos.put(Types.BALANCED.name(), new ArrayList<>());
            this.videos.put(Types.UNBALANCED.name(), new ArrayList<>());
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
                return videos.get(Types.EVAL.name()).size() >= VIDEO_LIMIT &&
                        videos.get(Types.BALANCED.name()).size() >= VIDEO_LIMIT &&
                        videos.get(Types.UNBALANCED.name()).size() >= VIDEO_LIMIT;
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
        Video v;
        for (Animal a : animals) {
            if (parts.containsAll(Arrays.asList(a.nameId, a.soundId))) {
                v = new Video(parts.get(0).trim(), parts.get(1).trim(), parts.get(2).trim(), type, a.name);
                a.addVideo(v);
                return;
            }
        }
        v = new Video(parts.get(0).trim(), parts.get(1).trim(), parts.get(2).trim(), type, "NOANIMAL");
        noAnimal.addVideo(v);
    }

    private static void printInfo() {
        for (String type : TYPES_LIST) {
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

    private static void downLoadAllVideos() {
        for (String type : TYPES_LIST) {
            for (Animal a : animals) {
                for (Video v : a.videos.get(type)) {
                    terminator.execute(v);
                }
            }
            for (Video v : noAnimal.videos.get(type)) {
                terminator.execute(v);
            }
        }
        terminator.shutdown();
        while (!terminator.isTerminated()) {
        }
        System.out.println("Finished all threads");
    }

    public static void main(String[] args) {
        BufferedReader reader;
        int i = 0, limit = LINE_LIMIT;
        try {
            for (String type : TYPES_LIST) {
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
        downLoadAllVideos();
    }
}
