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
	Sound,
	Sprite,
	vec,
} from "excalibur";
import { Images, Sounds } from "../misc/resources";

export const OreTypes = ["Iron", "Gold", "Silver"];

export class Asteroid extends Actor {
	private sprite: Sprite;
	public ore: string;
	private startAmount: number = 100;
	public amount: number = 100;
	private explosionSound: Sound = Sounds.Explosion;

	constructor(options?: { variation?: number } & ActorArgs) {
		const range = 10;
		super({
			name: "Asteroid",
			collisionType: CollisionType.Active,
			angularVelocity: randomInRange(-Math.PI, Math.PI),
			vel: vec(randomInRange(-range, range), randomInRange(-range, range)),
			pos: vec(
				randomIntInRange(0, 1) ? randomInRange(-50_000, -10_000) : randomInRange(10_000, 50_000),
				randomInRange(-100_000, 100_000),
			),
			...options,
		});

		const image = `Asteroid_0${options?.variation ?? randomIntInRange(0, 7)}`;
		this.sprite = Images[image as keyof typeof Images]?.toSprite({});

		this.ore = OreTypes[randomIntInRange(0, OreTypes.length - 1)];
		this.startAmount = randomIntInRange(1_000, 10_000);
		this.amount = this.startAmount;
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
		this.explosionSound.play();
		setTimeout(() => {
			emitter.isEmitting = false;
		}, 1_000);

		setTimeout(() => {
			emitter.kill();
		}, 3_000);
	}

	mine(miningRate: number) {
		this.amount -= miningRate;

		const ratio = this.amount / this.startAmount;
		this.scale = vec(ratio, ratio);

		if (ratio < 0.25) {
			this.kill();
		}
	}
}
