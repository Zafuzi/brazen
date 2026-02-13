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

export const OreTypes = [
	"Lithium",
	"Beryllium",
	"Sodium",
	"Magnesium",
	"Aluminum",
	"Potassium",
	"Calcium",
	"Scandium",
	"Titanium",
	"Vanadium",
	"Chromium",
	"Manganese",
	"Iron",
	"Cobalt",
	"Nickel",
	"Copper",
	"Zinc",
	"Gallium",
	"Germanium",
	"Rubidium",
	"Strontium",
	"Yttrium",
	"Zirconium",
	"Niobium",
	"Molybdenum",
	"Ruthenium",
	"Rhodium",
	"Palladium",
	"Silver",
	"Cadmium",
	"Indium",
	"Tin",
	"Antimony",
	"Tellurium",
	"Cesium",
	"Barium",
	"Lanthanum",
	"Cerium",
	"Praseodymium",
	"Neodymium",
	"Samarium",
	"Europium",
	"Gadolinium",
	"Terbium",
	"Dysprosium",
	"Holmium",
	"Erbium",
	"Thulium",
	"Ytterbium",
	"Lutetium",
	"Hafnium",
	"Tantalum",
	"Tungsten",
	"Rhenium",
	"Osmium",
	"Iridium",
	"Platinum",
	"Gold",
	"Mercury",
	"Thallium",
	"Lead",
	"Bismuth",
	"Thorium",
	"Uranium",
	"Arsenic",
	"Selenium",
	"Silicon",
	"Boron",
	"Actinium",
	"Protactinium",
	"Radium",
	"Polonium",
	"Aetherium",
	"Astralium",
	"Novaite",
	"Voidsteel",
	"Crysalon",
	"Pyronite",
	"Lunarium",
	"Solarium",
	"Quazarite",
	"Gravitite",
	"Ionite",
	"Fluxium",
	"Nebulite",
	"Darkiron",
	"Chronotite",
	"Helionite",
	"Mythrillium",
	"Obsidion",
	"Xenorium",
	"Arcadium",
	"Eclipsite",
	"Phasium",
	"Draconium",
	"Celestium",
	"Warpstone",
	"Stormsilver",
	"Nightgold",
	"Dawnsteel",
	"Bloodquartz",
	"Emberite",
	"Frostium",
	"Skyglass",
	"Verdanite",
	"Runeite",
	"Souliron",
	"Ghostmetal",
	"Pulsecrystal",
	"Abyssium",
	"Sunspike",
	"Moonshard",
	"Glimmerite",
	"Titanblood",
	"Magnetrine",
	"Spectrium",
	"Radiantine",
	"Nullstone",
	"Vortexium",
	"Stellarium",
	"Prismite",
	"Hexalloy",
	"Cindercore",
	"Thundrite",
	"Deepcore",
	"Shardium",
	"Blibonium",
	"Flignum",
	"Astrocloin",
	"Everfermenth",
] as const;

export type OreType = (typeof OreTypes)[number];

export class Asteroid extends Actor {
	private sprite: Sprite;
	public ore: OreType;
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
