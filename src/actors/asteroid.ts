import {
	Actor,
	ActorArgs,
	CircleCollider,
	CollisionType,
	Color,
	EmitterType,
	Engine,
	ParticleEmitter,
	randomInRange,
	randomIntInRange,
	Scene,
	Sprite,
	vec,
} from "excalibur";
import { Resources } from "../misc/resources";

export const OreTypes = ["Iron", "Gold", "Silver"];

export class Asteroid extends Actor {
	private sprite: Sprite;
	public ore: string;

	constructor(options?: { variation?: number } & ActorArgs) {
		const range = 10;
		super({
			name: "Asteroid",
			collisionType: CollisionType.Active,
			angularVelocity: randomInRange(-Math.PI, Math.PI),
			vel: vec(randomInRange(-range, range), randomInRange(-range, range)),
			pos: vec(randomInRange(-5_000, -200), randomInRange(-100_000, 100_000)),
			...options,
		});

		const image = `Asteroid_0${options?.variation ?? randomIntInRange(0, 7)}`;
		this.sprite = Resources[image as keyof typeof Resources]?.toSprite({});

		this.ore = OreTypes[randomIntInRange(0, OreTypes.length - 1)];
	}

	mine() {
		this.scale = this.scale.scale(0.98);
		if (this.scale.magnitude < 0.25) {
			this.kill();
		}
	}

	onInitialize(engine: Engine): void {
		this.graphics.add(this.sprite);

		this.collider.set(
			new CircleCollider({
				radius: this.graphics.bounds.width / 2,
			}),
		);

		this.body.mass = 1_000;
	}

	onPreKill(scene: Scene): void {
		const emitter = new ParticleEmitter({
			pos: this.pos,
			isEmitting: true,
			emitRate: 10,
			emitterType: EmitterType.Circle,
			radius: 32,
			particle: {
				minSpeed: 0,
				maxSpeed: 10,
				minAngle: 0,
				maxAngle: 0,
				minSize: 1,
				maxSize: 32,
				startSize: 16,
				endSize: 0,
				acc: vec(0, 0),
				life: 5000,
				opacity: 1,
				fade: true,
				beginColor: Color.White,
				endColor: Color.Transparent,
			},
		});

		scene.world.add(emitter);
		setTimeout(() => {
			emitter.isEmitting = false;
		}, 1_000);

		setTimeout(() => {
			emitter.kill();
		}, 3_000);
	}
}
