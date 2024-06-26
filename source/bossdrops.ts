export interface BossDrop {
	name: string
	rarity: string
	probability?: number
}
export interface RaidDrops {
	name: string
	rarity: string
	dropRate: number
}

export const bossDrops: Record<string, BossDrop[]> = {
	"Yasohachi Bridge Curse": [
		{ name: "Tailsman", rarity: "common" },
		{ name: "Super Glue", rarity: "rare" },
		{ name: "Cleaning Kit", rarity: "rare" },
		{ name: "Sukuna Finger", rarity: "very rare" }
	],
	"Cursed Spirit": [
		{ name: "Tailsman", rarity: "common" },
		{ name: "Super Glue", rarity: "rare" }
	],
	"Fly Heads": [
		{ name: "Tailsman", rarity: "common" },
		{ name: "Cleaning Kit", rarity: "rare" },
		{ name: "Super Glue", rarity: "rare" }
	],
	"Roppongi Curse": [
		{ name: "Tailsman", rarity: "common" },
		{ name: "Cleaning Kit", rarity: "rare" },
		{ name: "Super Glue", rarity: "rare" }
	],
	"Sukuna": [
		{ name: "Sukuna Finger", rarity: "common" },
		{ name: "Malevolent Shrine (Skull)", rarity: "rare" },
		{ name: "Malevolent Shrine (Blood Vial)", rarity: "rare" },
		{ name: "(Shattered) Domain Remnants", rarity: "rare" }
	],
	"Sukuna (Suppressed)": [
		{ name: "Sukuna Finger", rarity: "common" },
		{ name: "Fraud Poster", rarity: "rare" },
		{ name: "Bet Slip", rarity: "rare" },
		{ name: "(Shattered) Domain Remnants", rarity: "rare" }
	],

	"Zenin Toji": [
		{ name: "(Broken) Split Soul Katana", rarity: "common" },
		{ name: "Heavenly Chain", rarity: "rare" },
		{ name: "Zenin Toji's Blood", rarity: "ultra rare" }
	],
	"Zenin Toji (Reincarnation)": [
		{ name: "(Broken) Split Soul Katana", rarity: "common" },
		{ name: "Fractured Chain", rarity: "ultra rare" }
	],
	"Megumi Fushiguro": [
		{ name: "Shikigami Soul", rarity: "common" },
		{ name: "Super Glue", rarity: "rare" },
		{ name: "Cleaning Kit", rarity: "rare" },
		{ name: "(Broken) Divine General Wheel", rarity: "ultra rare" }
	],
	"Satoru Gojo": [
		{ name: "Rikugan Eye", rarity: "rare" },
		{ name: "Go//Jo", rarity: "ultra rare" },
		{ name: "Fraud Poster", rarity: "ultra rare" },
		{ name: "Heavenly Chain", rarity: "rare" },
		{ name: "(Shattered) Domain Remnants", rarity: "ultra rare" }
	],
	"Itadori": [
		{ name: "Tailsman", rarity: "rare" },
		{ name: "Sukuna Finger", rarity: "ultra rare" },
		{ name: "Fraud Poster", rarity: "ultra rare" },
		{ name: "Heavenly Chain", rarity: "rare" }
	],
	"Aoi Todo & Itadori": [
		{ name: "Brotherly Bracelet", rarity: "rare" },
		{ name: "Cleaning Kit", rarity: "rare" },
		{ name: "Takada-Chan Autograph", rarity: "rare" },
		{ name: "Heavenly Chain", rarity: "rare" }
	],
	"Jogo": [
		{ name: "Jogos left testicle", rarity: "rare" },
		{ name: "Jogos right testicle", rarity: "rare" },
		{ name: "(Shattered) Domain Remnants", rarity: "rare" }
	],
	"Mahito (Transfigured)": [
		{ name: "Transfigured Soul", rarity: "ultra rare" },
		{ name: "Junpei", rarity: "rare" },
		{ name: "(Shattered) Domain Remnants", rarity: "rare" }
	],
	"Suguru Geto": [
		{ name: "Rikugan Eye", rarity: "rare" },
		{ name: "Prison Realm Fragment", rarity: "rare" },
		{ name: "(Broken) Playful Cloud", rarity: "rare" },
		{ name: "Cleaning Kit", rarity: "rare" },
		{ name: "Transfigured Soul", rarity: "ultra rare" }
	],
	"The Honored One": [
		{ name: "Rikugan Eye", rarity: "rare" },
		{ name: "Sukuna Finger", rarity: "rare" },
		{ name: "Cleaning Kit", rarity: "rare" },
		{ name: "Six Eyes", rarity: "ultra rare" }
	],
	"Divine-General Mahoraga": [
		{ name: "Rikugan Eye", rarity: "rare" },
		{ name: "(Broken) Divine General Wheel", rarity: "rare" },
		{ name: "Tailsman", rarity: "rare" },
		{ name: "Cleaning Kit", rarity: "rare" },
		{ name: "(Fixed) Divine General Wheel", rarity: "ultra rare" }
	],
	"Mahito Instant Spirit Body of Distorted Killing": [
		{ name: "Transfigured Soul", rarity: "rare" },
		{ name: "Tailsman", rarity: "rare" },
		{ name: "Junpei", rarity: "ultra rare" },
		{ name: "Cleaning Kit", rarity: "rare" }
	],
	"Hakari Kinji": [
		{ name: "Rikugan Eye", rarity: "rare" },
		{ name: "Gambler Token", rarity: "rare" },
		{ name: "Bet Slip", rarity: "rare" },
		{ name: "(Shattered) Domain Remnants", rarity: "ultra rare" }
	],
	"Hakari (Jackpot)": [
		{ name: "Gambler Token", rarity: "rare" },
		{ name: "Bet Slip", rarity: "rare" },
		{ name: "Fraud Poster", rarity: "rare" },
		{ name: "Sukuna Finger", rarity: "rare" },
		{ name: "Rikugan Eye", rarity: "rare" },
		{ name: "(Shattered) Domain Remnants", rarity: "ultra rare" }
	],

	"Kashimo": [
		{ name: "Rikugan Eye", rarity: "rare" },
		{ name: "(Broken) Electrical Staff", rarity: "rare" },
		{ name: "Cleaning Kit", rarity: "rare" },
		{ name: "Tailsman", rarity: "rare" },
		{ name: "Sukuna Finger", rarity: "ultra rare" }
	],
	"Dagon": [
		{ name: "Blue Fish", rarity: "rare" },
		{ name: "Green Fish", rarity: "rare" },
		{ name: "(Shattered) Domain Remnants", rarity: "ultra rare" }
	],
	"Hanami": [
		{ name: "Wood Chippins", rarity: "rare" },
		{ name: "Cursed Bud", rarity: "rare" },
		{ name: "Special-Grade Medicine", rarity: "rare" },
		{ name: "Jogos (Fixed) Balls", rarity: "ultra rare" }
	],
	"Yuta Okkotsu": [
		{ name: "Rikugan Eye", rarity: "rare" },
		{ name: "Fraud Poster", rarity: "rare" },
		{ name: "Special-Grade Medicine", rarity: "rare" },
		{ name: "(Broken) Vengeance Katana", rarity: "rare" },
		{ name: "(Shattered) Domain Remnants", rarity: "ultra rare" }
	],
	"Finger Bearer": [
		{ name: "Rikugan Eye", rarity: "rare" },
		{ name: "Sukuna Finger", rarity: "rare" },
		{ name: "Cleaning Kit", rarity: "rare" },
		{ name: "Special-Grade Medicine", rarity: "rare" },
		{ name: "Cursed Shard", rarity: "rare" },
		{ name: "Junpei", rarity: "ultra rare" }
	],
	"Disaster Curses": [
		{ name: "Rikugan Eye", rarity: "rare" },
		{ name: "Dagons Soul", rarity: "rare" },
		{ name: "Special-Grade Medicine", rarity: "rare" },
		{ name: "Jogos Soul", rarity: "rare" },
		{ name: "Hanamis Soul", rarity: "ultra rare" }
	],
	"Zenin Toji (Reincarnated)": [
		{ name: "Rikugan Eye", rarity: "rare" },
		{ name: "Sukuna Finger", rarity: "rare" },
		{ name: "Special-Grade Medicine", rarity: "rare" },
		{ name: "(Shattered) Domain Remnants", rarity: "ultra rare" }
	],
	"Yuta Okkotsu (Rika)": [
		{ name: "Fraud Poster", rarity: "rare" },
		{ name: "(Broken) Vengeance Katana", rarity: "rare" },
		{ name: "Special-Grade Medicine", rarity: "rare" },
		{ name: "(Shattered) Domain Remnants", rarity: "ultra rare" },
		{ name: "Rikugan Eye", rarity: "ultra rare" },
		{ name: "Sukuna Finger", rarity: "ultra rare" },
		{ name: "Six Eyes", rarity: "ultra rare" },
		{ name: "Sacred Eye", rarity: "ultra rare" }
	],

	"Mahito": [
		{ name: "Transfigured Soul", rarity: "rare" },
		{ name: "(Broken) Vengeance Katana", rarity: "rare" }
	],
	"Mahito (120%)": [
		{ name: "Transfigured Soul", rarity: "rare" },
		{ name: "Special-Grade Medicine", rarity: "rare" },
		{ name: "Junpei", rarity: "rare" }
	],
	"Nobara Kugisaki": [
		{ name: "Nail", rarity: "rare" },
		{ name: "Hammer", rarity: "rare" },
		{ name: "Cleaning Kit", rarity: "rare" }
	],
	"Aoi Todo": [
		{ name: "Brotherly Bracelet", rarity: "rare" },
		{ name: "Special-Grade Cursed Object", rarity: "rare" },
		{ name: "Cleaning Kit", rarity: "rare" },
		{ name: "Takada-Chan Autograph", rarity: "rare" }
	],
	"Maki Zenin": [
		{ name: "(Broken) Playful Cloud", rarity: "rare" },
		{ name: "Special-Grade Cursed Object", rarity: "rare" },
		{ name: "Special-Grade Glasses", rarity: "rare" }
	],
	"Kento Nanami": [
		{ name: "Nanami", rarity: "rare" },
		{ name: "Special-Grade Medicine", rarity: "rare" },
		{ name: "(Shattered) Overtime Watch", rarity: "rare" },
		{ name: "Special-Grade Cursed Object", rarity: "rare" }
	],
	"Inumaki": [
		{ name: "Cough Medicine", rarity: "rare" },
		{ name: "Cleaning Kit", rarity: "rare" },
		{ name: "Megaphone", rarity: "rare" }
	],
	"Panda": [
		{ name: "Bamboo", rarity: "rare" },
		{ name: "Cleaning Kit", rarity: "rare" },
		{ name: "Special-Grade Cursed Object", rarity: "rare" },
		{ name: "Junpei", rarity: "rare" }
	],
	"Yuki Tsukumo": [
		{ name: "(Shattered) Star Fragment", rarity: "rare" },
		{ name: "Special-Grade Medicine", rarity: "rare" },
		{ name: "(Shattered) Star Remnant", rarity: "rare" },
		{ name: "Rikugan Eye", rarity: "ultra rare" }
	],
	"Satoru Gojo Limit-Broken": [
		{ name: "Fraud Poster", rarity: "rare" },
		{ name: "(Shattered) Domain Remnants", rarity: "ultra rare" },
		{ name: "Rikugan Eye", rarity: "ultra rare" },
		{ name: "Sukuna Finger", rarity: "ultra rare" },
		{ name: "Six Eyes", rarity: "ultra rare" },
		{ name: "Special-Grade Cursed Object", rarity: "rare" },
		{ name: "Cleaning Kit", rarity: "rare" },
		{ name: "Special-Grade Medicine", rarity: "rare" },
		{ name: "Sacred Eye", rarity: "ultra rare" }
	],
	"Choso": [
		{ name: "Cursed Womb Death Painting", rarity: "rare" },
		{ name: "(Shattered) Domain Remnants", rarity: "ultra rare" },
		{ name: "Rikugan Eye", rarity: "ultra rare" },
		{ name: "Special-Grade Cursed Object", rarity: "rare" },
		{ name: "Sukuna Finger", rarity: "ultra rare" }
	],
	"Yuji Itadori (Awoken)": [
		{ name: "Heian Era Scraps", rarity: "rare" },
		{ name: "Split Shard", rarity: "ultra rare" },
		{ name: "Special-Grade Cursed Object", rarity: "rare" },
		{ name: "Heian Era Scraps", rarity: "ultra rare" },
		{ name: "Awakening Remnant", rarity: "ultra rare" },
		{ name: "Sukuna Finger", rarity: "ultra rare" }
	],
	"Satoru Gojo (Shinjuku Showdown Arc)": [
		{ name: "Six Eyes", rarity: "rare" },
		{ name: "Split Shard", rarity: "ultra rare" },
		{ name: "Heian Era Scraps", rarity: "ultra rare" },
		{ name: "Awakening Remnant", rarity: "ultra rare" },
		{ name: "Sukuna Finger", rarity: "ultra rare" }
	],
	"Maki Zenin (Full Strength)": [
		{ name: "Heavenly Blood", rarity: "rare" },
		{ name: "Split Shard", rarity: "ultra rare" },
		{ name: "Awakening Remnant", rarity: "ultra rare" },
		{ name: "Heian Era Scraps", rarity: "ultra rare" }
	],
	"Lightning God (Heian Era)": [
		{ name: "Heavenly Blood", rarity: "rare" },
		{ name: "Split Shard", rarity: "ultra rare" },
		{ name: "Heian Era Scraps", rarity: "ultra rare" },
		{ name: "Awakening Remnant", rarity: "ultra rare" }
	],
	"Sukuna (Heian Era)": [{ name: "Hollow Wicker Basket Essence", rarity: "ultra rare" }],
	"Kenjaku": [
		{ name: "Mahitos Soul", rarity: "rare" },
		{ name: "Split Shard", rarity: "ultra rare" },
		{ name: "Heian Era Scraps", rarity: "ultra rare" }
	],
	"Sukuna (Heian Era Enraged)": [{ name: "Heian Era Soul", rarity: "common" }],
	//
	"Mahoraga": [{ name: "Mahoraga's Soul", rarity: "rare" }],
	"Divine Dogs": [{ name: "Divine Dogs Shikigami's Soul", rarity: "rare" }],
	"Nue": [{ name: "Bird Shikigami's Soul", rarity: "rare" }],
	"Toad": [{ name: "Toad Shikigami's Soul", rarity: "rare" }],
	"Great Serpent": [{ name: "Serpent Shikigami's Soul", rarity: "rare" }],
	"Max Elephant": [{ name: "Elephant Shikigami's Soul", rarity: "rare" }]
}

const raidBossDrops: { [bossName: string]: RaidDrops[] } = {
	"King of Curses": [
		{ name: "Sukuna Finger", rarity: "common", dropRate: 0.5 },
		{ name: "Heian Era Awakening Remnant", rarity: "rare", dropRate: 0.2 },
		{ name: "King's Token", rarity: "rare", dropRate: 0.1 },
		{ name: "Heian Era Awakening", rarity: "special grade", dropRate: 0.01 }
	],
	"Sukuna (Shibuya)": [
		{ name: "Sukuna Finger", rarity: "common", dropRate: 0.5 },
		{ name: "Heian Era Awakening Remnant", rarity: "rare", dropRate: 0.2 },
		{ name: "King's Token", rarity: "rare", dropRate: 0.1 },
		{ name: "Heian Era Awakening", rarity: "special grade", dropRate: 0.01 }
	],
	"The Honored One": [
		{ name: "Rikugan Eye", rarity: "common", dropRate: 0.5 },
		{ name: "Six Eyes", rarity: "common", dropRate: 0.2 },
		{ name: "Strongest Sorcerer's Token", rarity: "rare", dropRate: 0.1 },
		{ name: "The Strongest's Decree", rarity: "special grade", dropRate: 0.01 }
	],
	"Sorcerer Killer": [
		{ name: "Zenin Toji's Blood", rarity: "common", dropRate: 0.5 },
		{ name: "Sorcerer Killer's Token", rarity: "rare", dropRate: 0.1 },
		{ name: "Cursed Defect", rarity: "special grade", dropRate: 0.01 }
	]
}

export function getRaidBossDrop(bossName: string): RaidDrops {
	const drops = raidBossDrops[bossName]
	if (!drops) {
		throw new Error(`No drops found for raid boss "${bossName}"`)
	}

	const randomNumber = Math.random()
	let cumulativeDropRate = 0

	for (const drop of drops) {
		cumulativeDropRate += drop.dropRate
		if (randomNumber <= cumulativeDropRate) {
			return drop
		}
	}

	return null
}
