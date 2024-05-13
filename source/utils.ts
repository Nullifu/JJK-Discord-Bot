import { randomInt } from "crypto"

// Define mentor details with messages, images, and lines
const mentorDetails: { [key: string]: { message: string; imageUrl: string; lines: string[] } } = {
	"Satoru Gojo": {
		message: "You are under the guidance of Satoru Gojo, the strongest Jujutsu sorcerer.",
		imageUrl: "https://media1.tenor.com/m/DoXhSg0brxsAAAAC/gojo-satoru-satoru.gif",
		lines: ["Don't worry, I'm the strongest.", "What you lack is imagination.", "Shall we get a little rough?"]
	},
	"Curse King": {
		message: "Ryomen Sukuna, the King of Curses, watches over your training.",
		imageUrl: "https://media1.tenor.com/m/GxDg4OD6TkwAAAAC/sukuna-ryomen.gif",
		lines: ["I am the honored one, the King of Curses.", "Don't you dare underestimate me!", "Foolish."]
	},
	"Ryomen Sukuna": {
		message: "Ryomen Sukuna, the King of Curses, watches over your training." || "",
		imageUrl: "https://media1.tenor.com/images/67d2c6e6807b751da1b26fa11b17e8bc/tenor.gif?itemid=27159347" || "",
		lines: ["I am the honored one, the King of Curses.", "Don't you dare underestimate me!", "Foolish."] || []
	}
}

export function getMentorDetails(
	mentor: string,
	hasAwakening: boolean
): { message: string; imageUrl: string; line: string } {
	const details = mentorDetails[mentor] || {
		message: "You are under the guidance of an unknown mentor.",
		imageUrl: "",
		lines: ["As your mentor, I expect great things from you."]
	}

	let message = details.message
	if (hasAwakening) {
		message += " Your potential is awakening, unleashing new powers."
	}

	// Randomly select a line for the mentor
	const line = details.lines[randomInt(details.lines.length)]

	return { message: message, imageUrl: details.imageUrl, line: line }
}

export function getAwakeningDialogue(mentor: string, awakening: string): string {
	const dialogues: { [key: string]: { [key: string]: string } } = {
		"Satoru Gojo": {
			"Stage One":
				"You've taken the first step, but this is just the beginning. Keep pushing forward and never lose sight of your goals, Here's a quest, and some items to help..",
			"Stage Two":
				"I can see the determination in your eyes. You're starting to understand what it means to wield this power.",
			"Stage Three":
				"You're making progress, but don't get complacent. The road ahead is still long and challenging, Here's a quest.",
			"Stage Four": "I'm impressed by your growth. You're starting to tap into your true potential.",
			"Stage Five":
				"You've come a long way, but remember, with great power comes great responsibility. Use it wisely."
		},
		"Ryomen Sukuna": {
			"Stage One":
				"So, you've finally awakened a fraction of your power. Don't let it go to your head, brat, Here's a quest, and some items to help..",
			"Stage Two": "You're starting to show some promise, but you're still far from being a worthy vessel.",
			"Stage Three":
				"Not bad, kid. But don't think this means you're anywhere close to my level, Here's a quest.",
			"Stage Four":
				"I'll admit, you've got some talent. But talent alone won't save you from the horrors that await.",
			"Stage Five":
				"You've grown stronger, but remember, in this world, it's eat or be eaten. Never let your guard down."
		},
		"Curse King": {
			"Stage One":
				"So, you've finally awakened a fraction of your power. Don't let it go to your head, brat, Here's a quest, and some items to help..",
			"Stage Two": "You're starting to show some promise, but you're still far from being a worthy vessel.",
			"Stage Three":
				"Not bad, kid. But don't think this means you're anywhere close to my level, Here's a quest.",
			"Stage Four":
				"I'll admit, you've got some talent. But talent alone won't save you from the horrors that await.",
			"Stage Five":
				"You've grown stronger, but remember, in this world, it's eat or be eaten. Never let your guard down."
		}
	}

	return (
		dialogues[mentor]?.[awakening] ||
		`You have reached ${awakening}. Continue to hone your skills and push the boundaries of your power.`
	)
}

export function createFeverMeterBar(feverMeter: number, maxFeverMeter: number): string {
	const filledBlocks = "🟩"
	const emptyBlocks = "⬜"

	const filledPercentage = Math.floor((feverMeter / maxFeverMeter) * 100)
	const filledBlocksCount = Math.floor(filledPercentage / 10)
	const emptyBlocksCount = 10 - filledBlocksCount

	const feverMeterBar = filledBlocks.repeat(filledBlocksCount) + emptyBlocks.repeat(emptyBlocksCount)

	return `[${feverMeterBar}] ${filledPercentage}%`
}
