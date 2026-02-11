import {
	Actor,
	CircleCollider,
	Collider,
	CollisionContact,
	CollisionType,
	Color,
	EmitterType,
	Engine,
	ParticleEmitter,
	randomInRange,
	randomIntInRange,
	Side,
	Sprite,
	toRadians,
	vec,
	Vector,
} from "excalibur";
import { Resources } from "../misc/resources";
import { Player } from "./player";

export class Asteroid extends Actor {
	private emitter: ParticleEmitter;
	private sprite: Sprite;

	constructor() {
		const scale = randomInRange(0.8, 1.2);

		super({
			pos: vec(randomIntInRange(-5000, -1000), randomIntInRange(-10_000, 10_000)),
			acc: vec(randomInRange(-1, 1), randomInRange(-1, 1)),
			angularVelocity: toRadians(randomIntInRange(-10, 10)),
			collisionType: CollisionType.Active,
			scale: vec(scale, scale),
		});

		const image = `Asteroid_0${randomIntInRange(0, 7)}`;
		this.sprite = Resources[image as keyof typeof Resources]?.toSprite({});

		this.collider.set(
			new CircleCollider({
				radius: 48,
			}),
		);

		this.body.mass = scale * 1_000;

		this.emitter = new ParticleEmitter({
			pos: vec(0, 0),
			isEmitting: false,
			emitRate: 100,
			emitterType: EmitterType.Circle,
			radius: 32,
			particle: {
				minSpeed: 0,
				maxSpeed: 0,
				minAngle: 0,
				maxAngle: 0,
				minSize: 1,
				maxSize: 32,
				startSize: 10,
				endSize: 0,
				acc: vec(0, 0),
				life: 5000,
				opacity: 1,
				fade: true,
				beginColor: Color.White,
				endColor: Color.Transparent,
			},
		});

		this.addChild(this.emitter);
	}

	onInitialize(engine: Engine): void {
		this.graphics.add(this.sprite);
	}

	onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
		if (other.owner instanceof Player) {
			this.sprite.opacity = 0;
			this.vel = Vector.Zero;
			this.emitter.particle.maxSpeed = other.owner.vel.magnitude / 3;
			this.emitter.isEmitting = true;
			this.removeComponent(this.collider);

			other.owner.body.vel = other.owner.body.oldVel;

			setTimeout(() => {
				this.emitter.isEmitting = false;
			}, 100);

			setTimeout(() => {
				this.kill();
			}, 5_000);
		}
	}
}
