function setup()
{
    createCanvas(600, 500);

    mgr = new SceneManager();

    // Preload scenes. Preloading is normally optional
    // ... but needed if showNextScene() is used.
    mgr.addScene ( Animation1 );
    mgr.addScene ( Animation2 );
    mgr.addScene ( Animation3 );

    mgr.showNextScene();
}