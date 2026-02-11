import { Actor, Color, Engine, vec, Vector } from "excalibur";
import { Resources } from "../misc/resources";

export class Background extends Actor {
    constructor() {
        super({
            color: Color.Black
        });
    }

    /*
    onInitialize(engine: Engine) {
        // this.width = engine.screen.resolution.width;
        // this.height = engine.screen.resolution.height;

        this.z = -99;
        const background = Resources.Background.toSprite();

        this.pos = engine.currentScene.camera.pos
        this.anchor = vec(0.5, 0.5);

        background.destSize.width = engine.screen.resolution.width;
        background.destSize.height = engine.screen.resolution.height;

        this.graphics.add(background)
    }
        */
}