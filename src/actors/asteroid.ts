import { Actor, CircleCollider, CollisionType, Engine, randomInRange, randomIntInRange, toRadians, vec } from "excalibur";
import { Resources } from "../misc/resources";

export class Asteroid extends Actor {
    constructor() {
        const scale = randomInRange(0.8, 3);

        super({
            pos: vec(randomIntInRange(-5000, -1000), randomIntInRange(-5000, 5000)),
            acc: vec(randomInRange(-1, 1), randomInRange(-1, 1)),
            angularVelocity: toRadians(randomIntInRange(-10, 10)),
            collisionType: CollisionType.Active,
            scale: vec(scale, scale),
        })

        this.collider.set(new CircleCollider({
            radius: 48,
        }))
        this.body.mass = scale * 100;
    }

    onInitialize(engine: Engine): void {
        const image = `Asteroid_0${randomIntInRange(0, 7)}`;
        this.graphics.add(Resources[image as keyof typeof Resources]?.toSprite({
        }))
    }
}