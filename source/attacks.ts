/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommandInteraction } from "discord.js"
import { calculateDamageWithEffects } from "./statuseffects.js"

interface Attack {
	name: string
	probability: number
	baseDamage: (playerGrade: string) => number
}

function getGradeDamageBonus(grade: string): number {
	switch (grade) {
		case "Special Grade":
			return 1.3
		case "Grade 1":
			return 1.1
		case "Semi-Grade 1":
			return 1.0
		case "Grade 2":
			return 1.0
		case "Grade 3":
			return 1.0
		case "Grade 4":
		default:
			return 1.0
	}
}

export const attacks: Record<string, Attack[]> = {
	// Sukana's attacks
	"Fly Heads": [
		{
			name: "Cursed Blast",
			probability: 60,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 5 * gradeDamageBonus
			}
		},
		{
			name: "Cursed Strike",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 10 * gradeDamageBonus
			}
		},
		{
			name: "Cursed Pultz",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 10 * gradeDamageBonus
			}
		}
	],
	"Cursed Spirit": [
		{
			name: "Cursed Blast",
			probability: 60,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 5 * gradeDamageBonus
			}
		},
		{
			name: "Cursed Strike",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 10 * gradeDamageBonus
			}
		},
		{
			name: "Cursed Pultz",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 10 * gradeDamageBonus
			}
		}
	],
	"Roppongi Curse": [
		{
			name: "Cursed Blast",
			probability: 60,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 5 * gradeDamageBonus
			}
		},
		{
			name: "Cursed Strike",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 10 * gradeDamageBonus
			}
		},
		{
			name: "Cursed Pultz",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 10 * gradeDamageBonus
			}
		}
	],
	// Sukana's attacks
	"Sukuna": [
		{
			name: "Cleave",
			probability: 60,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 25 * gradeDamageBonus
			}
		},
		{
			name: "Domain Expansion: Malevolent Shrine!",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 30 * gradeDamageBonus
			}
		},
		{
			name: "Flame Arrow",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 40 * gradeDamageBonus
			}
		}
	],

	// Itadori's attacks
	"Itadori": [
		{
			name: "Black Flash",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 40 * gradeDamageBonus
			}
		},
		{
			name: "Divergent Fist: Hundred Folds!",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 25 * gradeDamageBonus
			}
		},
		{
			name: "Divergent Fist: Collapsing Spear",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 25 * gradeDamageBonus
			}
		}
	],

	// Gojo's attacks
	"Satoru Gojo": [
		{
			name: "Limitless: Blue!",
			probability: 40,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 35 * gradeDamageBonus
			}
		},
		{
			name: "Reversal: Red",
			probability: 40,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 30 * gradeDamageBonus
			}
		},
		{
			name: "Hollow: PURPLE!",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 50 * gradeDamageBonus
			}
		}
	],
	// Itadori's attacks
	"Aoi Todo & Itadori": [
		{
			name: "Brotherly Bond: Chain Blitz!",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 25 * gradeDamageBonus
			}
		},
		{
			name: "Unison Impact",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 25 * gradeDamageBonus
			}
		}
	],
	// Itadori's attacks
	"Megumi Fushiguro": [
		{
			name: "Divine Dogs: Shadow Pursuit",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 25 * gradeDamageBonus
			}
		},
		{
			name: "Domain Expansion: Chimera Shadow Garden",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 25 * gradeDamageBonus
			}
		},
		{
			name: "Shikigami Fusion: Shadow Behemoth",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 25 * gradeDamageBonus
			}
		}
	],
	// Itadori's attacks
	"Zenin Toji": [
		{
			name: "Soul Severance",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 30 * gradeDamageBonus
			}
		},
		{
			name: "Chain Snare",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 35 * gradeDamageBonus
			}
		},
		{
			name: "Null Strike",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 20 * gradeDamageBonus
			}
		}
	],
	// Itadori's attacks
	"Sukuna (Suppressed)": [
		{
			name: "Fire Manipulation (Weakened)",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 20 * gradeDamageBonus
			}
		},
		{
			name: "Barrage of punches",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 25 * gradeDamageBonus
			}
		},
		{
			name: "Null Strike",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 25 * gradeDamageBonus
			}
		}
	],
	// geto
	"Suguru Geto": [
		{
			name: "Cursed Spirit Manipulation",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 25 * gradeDamageBonus
			}
		},
		{
			name: "Cursed Energy Blast",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 14 * gradeDamageBonus
			}
		},
		{
			name: "Cursed Energy Barrier",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 25 * gradeDamageBonus
			}
		}
	],
	// Jogo
	"Jogo": [
		{
			name: "Fire Manipulation",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 19 * gradeDamageBonus
			}
		},
		{
			name: "Fireball",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 18 * gradeDamageBonus
			}
		},
		{
			name: "MAXIMUM TECHNIQUE: METEOR!!!!",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 30 * gradeDamageBonus
			}
		}
	],
	// Mahito
	"Mahito (Transfigured)": [
		{
			name: "Transfiguration",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 50 * gradeDamageBonus
			}
		},
		{
			name: "Polymorphic Soul Isomer",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 60 * gradeDamageBonus
			}
		},
		{
			name: "Mewetenpen",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 60 * gradeDamageBonus
			}
		}
	],
	// Mahito
	"The Honored One": [
		{
			name: "Awakened: Lapse Blue",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 25 * gradeDamageBonus
			}
		},
		{
			name: "Awakened: Reversal Red",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 17 * gradeDamageBonus
			}
		},
		{
			name: "Imaginary Technique: Purple",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 30 * gradeDamageBonus
			}
		}
	],
	// Mahito
	"Mahoraga": [
		{
			name: "Adapted: Strike",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 25 * gradeDamageBonus
			}
		},
		{
			name: "Pummel",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 17 * gradeDamageBonus
			}
		},
		{
			name: "Adapted: Blast",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 30 * gradeDamageBonus
			}
		}
	],

	"Mahito Instant Spirit Body of Distorted Killing": [
		{
			name: "Soul Multiplicity",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 56 * gradeDamageBonus
			}
		},
		{
			name: "Soul Snatch",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 45 * gradeDamageBonus
			}
		},
		{
			name: "Domain Expansion: Self Embodiment of Perfection",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 110 * gradeDamageBonus
			}
		}
	],

	"Kashimo": [
		{
			name: "Electricity Manipulation",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 25 * gradeDamageBonus
			}
		},
		{
			name: "Electricity Blast",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 17 * gradeDamageBonus
			}
		},
		{
			name: "Electrified Strike",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 30 * gradeDamageBonus
			}
		}
	],

	"Hakari Kinji": [
		{
			name: "Barrage",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 25 * gradeDamageBonus
			}
		},
		{
			name: "Gamblers Strike",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 17 * gradeDamageBonus
			}
		},
		{
			name: "Jackpot: Cargo Rush",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 30 * gradeDamageBonus
			}
		}
	],

	"Hakari (Jackpot)": [
		{
			name: "Jackpot: Fleeting Rush",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 25 * gradeDamageBonus
			}
		},
		{
			name: "Private Pure Love Train: Pachinko Rush",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 17 * gradeDamageBonus
			}
		},
		{
			name: "Private Pure Love Train: Cargo Rush",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 30 * gradeDamageBonus
			}
		}
	],

	"Finger Bearer": [
		{
			name: "Strike",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 25 * gradeDamageBonus
			}
		},
		{
			name: "Cursed Energy Blast",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 17 * gradeDamageBonus
			}
		},
		{
			name: "Explosion",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 20 * gradeDamageBonus
			}
		}
	],

	"Yuta Okkotsu": [
		{
			name: "Black Flash",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 25 * gradeDamageBonus
			}
		},
		{
			name: "Steel Arm: Freeze Flash",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 17 * gradeDamageBonus
			}
		},
		{
			name: "Vengeance: Executioner's Blade",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 30 * gradeDamageBonus
			}
		}
	],

	"Yuta Okkotsu (Rika)": [
		{
			name: "Combined Attack: Black Flash",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 25 * gradeDamageBonus
			}
		},
		{
			name: "Curse Queen: Rika's Rampage",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 17 * gradeDamageBonus
			}
		},
		{
			name: "Pure Love: Rika's Embrace",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 70 * gradeDamageBonus
			}
		}
	],

	"Yuki Tsukumo": [
		{
			name: "Star Rage: Virtual Mass",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 70 * gradeDamageBonus
			}
		},
		{
			name: "Star Rage: Virtual Mars",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 17 * gradeDamageBonus
			}
		},
		{
			name: "Star Rage: Virtual Earth",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 40 * gradeDamageBonus
			}
		}
	],

	"Sukuna (Heian Era)": [
		{
			name: "Kamutoke",
			probability: 60,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 90 * gradeDamageBonus
			}
		},
		{
			name: "Domain Expansion: Malevolent Shrine",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 70 * gradeDamageBonus
			}
		},
		{
			name: "World Cutting Slash",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 140 * gradeDamageBonus
			}
		}
	],

	"Zenin Toji (Reincarnated)": [
		{
			name: "Purgatory",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 25 * gradeDamageBonus
			}
		},
		{
			name: "Bloodlusted: Skull Crush",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 17 * gradeDamageBonus
			}
		},
		{
			name: "Racism: World Cutting Slash",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 30 * gradeDamageBonus
			}
		}
	],

	"Disaster Curses": [
		{
			name: "Combined: Stream",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 25 * gradeDamageBonus
			}
		},
		{
			name: "Combined: Waterfall",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 17 * gradeDamageBonus
			}
		},
		{
			name: "Combined: Fluxing Stream",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 50 * gradeDamageBonus
			}
		}
	],

	"Dagon": [
		{
			name: "Oceanic: Stream",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 25 * gradeDamageBonus
			}
		},
		{
			name: "Disaster Tides: Death Swarm",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 17 * gradeDamageBonus
			}
		},
		{
			name: "Horizon of the Captivating Skandha",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 50 * gradeDamageBonus
			}
		}
	],

	"Hanami": [
		{
			name: "Flower Garden",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 25 * gradeDamageBonus
			}
		},
		{
			name: "Cursed Bud",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 17 * gradeDamageBonus
			}
		},
		{
			name: "World of Cursed Blossoms",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 50 * gradeDamageBonus
			}
		}
	],

	"Mahito": [
		{
			name: "Transfiguration",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 14 * gradeDamageBonus
			}
		},
		{
			name: "Soul Touch",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 41 * gradeDamageBonus
			}
		},
		{
			name: "Cloning Technique",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 26 * gradeDamageBonus
			}
		}
	],

	"Mahito (120%)": [
		{
			name: "Limit-Broken: Transfiguration",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 32 * gradeDamageBonus
			}
		},
		{
			name: "120% Soul Touch",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 28 * gradeDamageBonus
			}
		},
		{
			name: "120% Cloning Technique",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 42 * gradeDamageBonus
			}
		}
	],

	"Panda": [
		{
			name: "Panda Punch",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 20 * gradeDamageBonus
			}
		},
		{
			name: "Panda Rage",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 20 * gradeDamageBonus
			}
		},
		{
			name: "Panda Pultz",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 24 * gradeDamageBonus
			}
		}
	],

	"Inumaki": [
		{
			name: "Cursed Speech: Die",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 20 * gradeDamageBonus
			}
		},
		{
			name: "Cursed Speech: Twist",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 20 * gradeDamageBonus
			}
		},
		{
			name: "Cursed Speech: Bind",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 24 * gradeDamageBonus
			}
		}
	],

	"Maki Zenin": [
		{
			name: "Zenin Style: Strike",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 20 * gradeDamageBonus
			}
		},
		{
			name: "Blitz",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 20 * gradeDamageBonus
			}
		},
		{
			name: "Acrobatic Strike",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 40 * gradeDamageBonus
			}
		}
	],

	"Kento Nanami": [
		{
			name: "Overtime: Ratio",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 20 * gradeDamageBonus
			}
		},
		{
			name: "Overtime: Maximum",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 20 * gradeDamageBonus
			}
		},
		{
			name: "Overtime: Limit",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 40 * gradeDamageBonus
			}
		}
	],

	"Yasohachi Bridge Curse": [
		{
			name: "Curse Blast",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 20 * gradeDamageBonus
			}
		},
		{
			name: "Curse Strike",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 20 * gradeDamageBonus
			}
		},
		{
			name: "Curse Pultz",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 40 * gradeDamageBonus
			}
		}
	],
	"Nobara Kugisaki": [
		{
			name: "Hairpin",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 40 * gradeDamageBonus
			}
		},
		{
			name: "Resonance",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 40 * gradeDamageBonus
			}
		},
		{
			name: "Black Flash",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 40 * gradeDamageBonus
			}
		}
	],
	"Aoi Todo": [
		{
			name: "Boogie Woogie: Surplex",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 20 * gradeDamageBonus
			}
		},
		{
			name: "Boogie Woogie: Swap",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 20 * gradeDamageBonus
			}
		},
		{
			name: "Black Flash",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 40 * gradeDamageBonus
			}
		}
	],

	"Satoru Gojo Limit-Broken": [
		{
			name: "100% Maximum Technique: Blue!",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 50 * gradeDamageBonus
			}
		},
		{
			name: "100% Reversal Red",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 60 * gradeDamageBonus
			}
		},
		{
			name: "200% Hollow Purple",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 80 * gradeDamageBonus
			}
		}
	],

	"Divine Dogs": [
		{
			name: "Divine Dogs: Bite",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 30 * gradeDamageBonus
			}
		},
		{
			name: "Divine Dogs: Shadow Pursuit",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 30 * gradeDamageBonus
			}
		},
		{
			name: "Divine Dogs: Twin Wolves",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 40 * gradeDamageBonus
			}
		}
	],

	"Nue": [
		{
			name: "Nue: Bite",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 30 * gradeDamageBonus
			}
		},
		{
			name: "Nue: Dropdown Strike",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 30 * gradeDamageBonus
			}
		},
		{
			name: "Nut: Lightning Manipulation",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 40 * gradeDamageBonus
			}
		}
	],

	"Toad": [
		{
			name: "ribbit",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 1 * gradeDamageBonus
			}
		},
		{
			name: "ribbit1",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 30 * gradeDamageBonus
			}
		},
		{
			name: "Domain Expansion: ribbit2",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 120 * gradeDamageBonus
			}
		}
	],

	"Great Serpent": [
		{
			name: "Ssss-Strike",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 20 * gradeDamageBonus
			}
		},
		{
			name: "Worm Strike",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 40 * gradeDamageBonus
			}
		},
		{
			name: "Serpent Strike",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 30 * gradeDamageBonus
			}
		}
	],

	"Max Elephant": [
		{
			name: "Water Manipulation",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 20 * gradeDamageBonus
			}
		},
		{
			name: "Belly Flop",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 40 * gradeDamageBonus
			}
		},
		{
			name: "Elephant Charge",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 30 * gradeDamageBonus
			}
		}
	],

	"Divine-General Mahoraga": [
		{
			name: "Foresight Adaption",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 40 * gradeDamageBonus
			}
		},
		{
			name: "?$!h!@",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 60 * gradeDamageBonus
			}
		},
		{
			name: "Divine-General Blade",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 175 * gradeDamageBonus
			}
		}
	],
	"Satoru Gojo (Shinjuku Showdown Arc)": [
		{
			name: "Hollow Nuke",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 60 * gradeDamageBonus
			}
		},
		{
			name: "Close Up: Reversal Red",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 40 * gradeDamageBonus
			}
		},
		{
			name: "Domain Expansion: Infinite Void",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 120 * gradeDamageBonus
			}
		}
	],
	"Maki Zenin (Full Strength)": [
		{
			name: "2-4 Kick Combo",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 45 * gradeDamageBonus
			}
		},
		{
			name: "Split Soul Bounding Strike",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 76 * gradeDamageBonus
			}
		},
		{
			name: "Zenin Style: Pummel",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 49 * gradeDamageBonus
			}
		}
	],
	"Choso": [
		{
			name: "Supernova",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 35 * gradeDamageBonus
			}
		},
		{
			name: "Convergence: Blood Manipulation",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 20 * gradeDamageBonus
			}
		},
		{
			name: "Piercing Blood",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 60 * gradeDamageBonus
			}
		}
	],
	"Yuji Itadori (Awoken)": [
		{
			name: "Two-Finger Strike",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 35 * gradeDamageBonus
			}
		},
		{
			name: "Piercing Blood",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 30 * gradeDamageBonus
			}
		},
		{
			name: "BLACK FLASH",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 60 * gradeDamageBonus
			}
		}
	],
	"Lightning God (Heian Era)": [
		{
			name: "Piercing Thunder",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 35 * gradeDamageBonus
			}
		},
		{
			name: "Lightning God's Wrath",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 30 * gradeDamageBonus
			}
		},
		{
			name: "Mythical Beast Amber",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 60 * gradeDamageBonus
			}
		}
	],
	"Kenjaku": [
		{
			name: "Barrage",
			probability: 50,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 35 * gradeDamageBonus
			}
		},
		{
			name: "Curse Spirit Manipulation: Cursed Energy Blast",
			probability: 30,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 30 * gradeDamageBonus
			}
		},
		{
			name: "World of Cursed Blossoms",
			probability: 20,
			baseDamage: (playerGrade: string) => {
				const gradeDamageBonus = getGradeDamageBonus(playerGrade)
				return 60 * gradeDamageBonus
			}
		}
	]
}

export function chooseRandomAttackForBossBasedOnProbability(attacks: Attack[]): Attack {
	let totalProbability = 0
	for (const attack of attacks) {
		totalProbability += attack.probability
	}
	const scaledRandomNumber = Math.random() * totalProbability

	let cumulativeProbability = 0
	for (const attack of attacks) {
		cumulativeProbability += attack.probability
		if (scaledRandomNumber <= cumulativeProbability) {
			return attack
		}
	}

	return attacks[attacks.length - 1]
}

export const DOMAIN_INFORMATION = [
	{
		name: "Malevolent Shrine",
		description:
			"Sukuna's Malevolent Shrine is a nightmarish domain of bones and skulls, where his attacks never miss.  It's a chilling testament to his limitless power and boundless cruelty.",
		image: "https://i.redd.it/p1zq5wjwxr0c1.jpg",
		effects: "Curse King, 20% Damage Reduction, 20% Damage Increase [ MORE SOON ]",
		requirement: "Malevolent Token"
	},
	{
		name: "Unlimited Void",
		description: "This domain overwhelms the target with an infinite thought, rendering them powerless...",
		image: "https://storage.googleapis.com/jjk_bot_personal/FWv4Sg9WIAUmp8k.jpg",
		effects: "Limitless, 20% Damage Reduction, 20% Damage Increase [ MORE SOON ]",
		requirement: "Limitless Token"
	},
	{
		name: "Chimera Shadow Garden",
		description:
			"Chimera Shadow Garden is a domain that creates a nightmarish world of shadows, where the users shikigami can attack from any angle.",
		image: "https://storage.googleapis.com/jjk_bot/EjfyNxvUwAAj485.jpg",
		effects: "Shadows, 20% Damage Reduction, 20% Damage Increase [ MORE SOON ]",
		requirement: "Shadow Token"
	},
	{
		name: "Coffin of the Iron Mountain",
		description: "A domain expansion that traps the target in a Volcano...",
		image: "https://pbs.twimg.com/media/EmuPKcNVkAE5Kbm.jpg:large",
		effects: "Volcano Head, 20% Damage Increase, 20% Damage Reduction [ MORE SOON ]",
		requirement: "Volcano Token"
	},
	{
		name: "Horizon of the Captivating Skandha",
		description: "blorp glorp (fish noise).",
		image: "https://pbs.twimg.com/media/GIE88o0WAAAJyeh.jpg",
		effects: "Beach Bum, 20% Damage Increase, 20% Damage Reduction [ MORE SOON ]",
		requirement: "Dagon's Token"
	},
	{
		name: "Idle Deaths Gamble",
		description: "A Gamble With Fate....",
		image: "https://cdn.discordapp.com/attachments/1094302755960664255/1226005623372775426/Idle_Death_Gamble.png?ex=662331b6&is=6610bcb6&hm=a8eeb6acc464dbe6f44b686d5fc32fca2950bbb61a6f426fffce6a4066123e6b&",
		effects:
			"Gamblers Limit, 50/50 Chance to do 30% more damage And 10% DMG Reduction, or 25% Less Damage and 10% Damage Taken Increase [ MORE SOON ]",
		requirement: "Hakari Kinji's Token"
	},
	{
		name: "Self-Embodiment of Perfection",
		description: "The true nature of the soul..",
		image: "https://static.wikia.nocookie.net/jujutsu-kaisen/images/2/23/Mahito%27s_Territorial_Expansion_Mahayana_Prison.png/revision/latest?cb=20190601212135",
		effects: "Soul Touch: 20% Damage Increase, 20% Damage Reduction. [ MORE SOON ]",
		requirement: "Soul Token"
	},
	{
		name: "True and Mutual Love",
		description: "Rika, Lend me your strength! and i'll be yours forever!",
		image: "https://cdn.discordapp.com/attachments/1094302755960664255/1226022659700297748/main-qimg-677cba957d89c255d384c0778fc9af97.jpg?ex=66234194&is=6610cc94&hm=22163f50298e2e83a729e448ec619eb9079af3a5c9b2064d34ca28d3a81cefa6&",
		effects: "Mutual Love: 30% Damage Increase, 25% Damage Reduction. [ MORE SOON ]",
		requirement: "Mutual Token"
	}
]

export const TRANSFORMATIONS = [
	{
		name: "Curse King",
		description: "AH I KNEW IT THE LIGHT FEELS BEST IN THE FLESH!",
		image: "https://media1.tenor.com/m/qkbOyZZSWxAAAAAd/sukuna-laugh.gif",
		effects: "1000 Year Curse, 25% Damage Increase, 5% Damage Reduction"
	},
	{
		name: "Bloodlusted",
		description: "I'm going to enjoy this...",
		image: "https://storage.googleapis.com/jjk_bot_personal/ezgif-7-394c1f41b7.gif",
		effects: "Bloodlust, 30% Damage Increase, 11% Damage Taken Increase"
	},
	{
		name: "Body of Distorted Killing",
		description: "Idle Transfiguration...",
		image: "https://media1.tenor.com/m/1tna9DzZLccAAAAd/jjk-jujutsu-kaisen.gif",
		effects: "Transfiguration, 25% Damage Increase, 5% Damage Reduction"
	},
	{
		name: "Six Eyes Release",
		description: "Come on, let's get serious.",
		image: "https://storage.googleapis.com/jjk_bot_personal/ezgif-7-e770a26839.gif",
		effects: "All-Seeing, 25% Damage Reduction, 16% Damage Increase"
	},
	{
		name: "Curse Queen",
		description: "Rika.. Lend me your strength.",
		image: "https://64.media.tumblr.com/33cacf2a119115bcdb869f76c68e16d9/df6ff4dc29f5c53a-f9/s540x810/71e5c78b6b6ed34d000aee942ff70641e18414f6.gif",
		effects: "Release of the Queen, 28% Damage Increase, 1% Damage Reduction"
	},
	{
		name: "Cursed Energy Reinforcement",
		description: "Reinforce your cursed energy to increase your power!",
		image: "https://media1.tenor.com/m/QZAfD8Pdb2wAAAAC/itadori-yuji-cursed-energy.gif",
		effects: "Reinforcement, 15% Damage Reduction"
	},
	{
		name: "Overtime",
		description: "Good Grief man, I'm tired of this job.",
		image: "https://media1.tenor.com/m/1UCA18ZgFpsAAAAd/nanami-nanami-kento.gif",
		effects: "Overtime, 20% Damage Increase, 10% Damage Reduction"
	},
	{
		name: "Maximum Output",
		description: "TURN UP THE VOLUME!",
		image: "https://storage.googleapis.com/jjk_bot_personal/ezgif-7-836d9bbead.gif",
		effects: "Electrified, 25% Damage Increase."
	},
	{
		name: "Awakening",
		description: "I'm going to enjoy this...",
		image: "https://media1.tenor.com/m/PejM2csl_9sAAAAd/itadori-yuuji.gif",
		effects: "Unleashed, 35% Damage Increase, 15% Extra Damage Taken"
	},
	// Owner
	{
		name: "Mugetsu",
		description:
			"Let's end this, Aizen! I'll show you... The Final Getsuga Tensho! This technique allows me to become Getsuga itself. But using it, will cost all my powers as a Shinigami.!",
		image: "https://media1.tenor.com/m/7GgfegR83eIAAAAC/ichigo-kurosaki-final-getsuga-tenshou.gif",
		effects: "Final Getsuga Tensho, ?!$£!% Damage Increase, "
	},
	{
		name: "Ultra Instinct",
		description: "I am the hope of the universe. I am the answer to all living things that cry out for peace...",
		image: "https://i.redd.it/y03e7f1ojto71.gif",
		effects: "INSTINCT, 8000% Damage Increase, 100% Damage Reduction"
	}
]

export const heavenlyrestrictionskills = {
	"Zenin Toji": [
		{
			name: "Inverted Spear Of Heaven: Severed Universe",
			cost: "1250000",
			clan: "Zenin Toji",
			items: [{ name: "Heavenly Restricted Blood", quantity: 1 }]
		},
		{
			name: "Batter",
			cost: "185000",
			clan: "Zenin Toji",
			items: [{ name: "Rikugan Eye", quantity: 1 }]
		},
		{
			name: "Split Second Slice",
			cost: "100000",
			clan: "Zenin Toji",
			items: [{ name: "Sukuna Finger", quantity: 1 }]
		}
	],
	"Maki Zenin": [
		{
			name: "Close Quarters 2-4 Combo",
			cost: "335000",
			clan: "Maki Zenin",
			items: [{ name: "Heavenly Restricted Blood", quantity: 1 }]
		},
		{
			name: "Playful Cloud: Upright Spear",
			cost: "225000",
			clan: "Maki Zenin",
			items: [{ name: "Rikugan Eye", quantity: 1 }]
		},
		{
			name: "Bo Staff: Redirection",
			cost: "125000",
			clan: "Maki Zenin",
			items: [{ name: "Sukuna Finger", quantity: 1 }]
		}
	],
	"Maki Zenin (Realized)": [
		{
			name: "Split Soul: Blitz",
			cost: "2600000",
			clan: "Maki Zenin",
			items: [{ name: "Awakening Remnant", quantity: 6 }],
			stage: "Stage Four"
		},
		{
			name: "0.2 Second Strike",
			cost: "1249000",
			clan: "Maki Zenin",
			items: [{ name: "Awakening Remnant", quantity: 4 }],
			stage: "Stage Four"
		},
		{
			name: "Split Soul: Slash",
			cost: "934510",
			clan: "Maki Zenin",
			items: [{ name: "Awakening Remnant", quantity: 2 }],
			stage: "Stage Four"
		}
	],
	"Zenin Toji (Reincarnation)": [
		{
			name: "Playful Cloud: Rushing Resolute",
			cost: "10000000",
			clan: "Zenin Toji (Reincarnation)",
			items: [
				{ name: "Sukuna Finger", quantity: 6 },
				{ name: "Heavenly Restricted Blood", quantity: 1 },
				{ name: "Awakening Remnant", quantity: 4 }
			],
			stage: "Stage Five"
		},
		{
			name: "Bloodlusted: Skull Crush",
			cost: "5000000",
			clan: "Zenin Toji (Reincarnation)",
			items: [{ name: "Awakening Remnant", quantity: 4 }],
			stage: "Stage Five"
		},
		{
			name: "Split Slap",
			cost: "2500000",
			clan: "Zenin Toji (Reincarnation)",
			items: [{ name: "Awakening Remnant", quantity: 2 }],
			stage: "Stage Five"
		}
	]
}
export async function executeBossAttack(
	interaction: CommandInteraction,
	randomOpponent: any,
	chosenAttack: any,
	playerGrade: string,
	primaryEmbed: any,
	playerHealth: number,
	statusEffects: any[],
	row: any
) {
	const baseDamage = chosenAttack.baseDamage(playerGrade)
	await calculateDamageWithEffects(interaction.user.id, baseDamage, statusEffects)
	const damageToPlayer = baseDamage
	const newPlayerHealth = playerHealth - damageToPlayer
	const clampedPlayerHealth = Math.max(0, newPlayerHealth)

	switch (true) {
		case chosenAttack.name === "Domain Expansion: Infinite Void" &&
			randomOpponent.name === "Satoru Gojo (Shinjuku Showdown Arc)":
			primaryEmbed.setDescription(`${randomOpponent.name} used ${chosenAttack.name}!`)
			primaryEmbed.setImage("https://media1.tenor.com/m/9ZHCYYVz5VcAAAAC/notl-gojo-vs-sukuna.gif")

			// Remove the select menu
			await interaction.editReply({
				embeds: [primaryEmbed],
				components: []
			})

			// Wait for 3 seconds
			await new Promise(resolve => setTimeout(resolve, 3000))

			primaryEmbed.setImage(randomOpponent.image_url)
			await interaction.editReply({
				embeds: [primaryEmbed],
				components: [row]
			})
			break

		case chosenAttack.name === "Domain Expansion: Malevolent Shrine" &&
			randomOpponent.name === "Sukuna (Heian Era)":
			primaryEmbed.setDescription(`${randomOpponent.name} used ${chosenAttack.name}!`)
			primaryEmbed.setImage("https://media1.tenor.com/m/NiiOh24vaJIAAAAC/domain-expansion-sukuna.gif")

			// Remove the select menu
			await interaction.editReply({
				embeds: [primaryEmbed],
				components: []
			})

			// Wait for 3 seconds
			await new Promise(resolve => setTimeout(resolve, 3000))

			await interaction.editReply({
				embeds: [primaryEmbed],
				components: [row]
			})
			break

		case chosenAttack.name === "Special Attack 2" && randomOpponent.name === "Boss 2":
			// Handle special case for Boss 2 and Special Attack 2
			primaryEmbed.setDescription(`${randomOpponent.name} used ${chosenAttack.name}!`)
			// Add any additional logic or effects specific to this case
			primaryEmbed.addFields({ name: "Damage", value: `${damageToPlayer}` })
			break

		default:
			primaryEmbed.setDescription(`${randomOpponent.name} used ${chosenAttack.name}!`)
			break
	}

	return clampedPlayerHealth
}
