import { StringSelectMenuBuilder } from "@discordjs/builders"
import { randomInt } from "crypto"
import { ActionRowBuilder, EmbedBuilder, SelectMenuBuilder } from "discord.js"
import { generateHealthBar } from "./fight.js"
import { getUserHealth, getUserTechniques } from "./mongodb.js"

interface CommunityQuest {
	questName: string
	questDescription: string
	task: string
	taskAmount: number
	currentProgress: number
	rewardItem: string
	rewardAmount: number
	startDate: Date
	endDate: Date
}

export const mentorDetails: {
	[key: string]: { message: string; imageUrl: string; lines: string[]; eventLines?: string[] }
} = {
	"Satoru Gojo": {
		message: "You are under the guidance of Satoru Gojo, the strongest Jujutsu sorcerer.",
		imageUrl: "https://media1.tenor.com/m/DoXhSg0brxsAAAAC/gojo-satoru-satoru.gif",
		lines: ["Don't worry, I'm the strongest.", "What you lack is imagination.", "Shall we get a little rough?"]
	},
	"Curse King": {
		message: "Ryomen Sukuna, the King of Curses, watches over your training.",
		imageUrl: "https://media1.tenor.com/m/GxDg4OD6TkwAAAAC/sukuna-ryomen.gif",
		lines: ["I am the honored one, the King of Curses.", "Don't you dare underestimate me!", "Foolish."],
		eventLines: [
			"Well, well, the strongest sorcerer has been sealed. How intriguing.",
			"With Satoru Gojo out of the picture, the balance of power has shifted.",
			"Satoru Gojo's absence has created an interesting opportunity. Let's see what happens.",
			"Satoru Gojo's been sealed, huh? This could be fun.",
			"Brat, You better not aid in unsealing Gojo, or you'll regret it."
		]
	},
	"Ryomen Sukuna": {
		message: "Ryomen Sukuna, the King of Curses, watches over your training.",
		imageUrl: "https://media1.tenor.com/m/cByKGAOSVd4AAAAC/jogo-vs-sukuna-ryomen-sukuna.gif",
		lines: ["I am the honored one, the King of Curses.", "Don't you dare underestimate me!", "Foolish."],
		eventLines: [
			"Well, well, the strongest sorcerer has been sealed. How intriguing.",
			"With Satoru Gojo out of the picture, the balance of power has shifted.",
			"Satoru Gojo's absence has created an interesting opportunity. Let's see what happens.",
			"Satoru Gojo's been sealed, huh? This could be fun.",
			"Brat, You better not aid in unsealing Gojo, or you'll regret it."
		]
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

export function getYujiItadoriImageUrl(): string {
	return "https://media1.tenor.com/m/j1qqqFxjlr4AAAAC/jujutsu-kaisen-jjk.gif"
}

export function getYujiItadoriLine(): string {
	const lines = [
		"Hey there! Satoru Gojo is currently sealed, so I'll be your mentor for now.",
		"Let's train together and become stronger!",
		"We'll find a way to unseal Satoru Gojo, but in the meantime, I've got your back."
	]
	return lines[Math.floor(Math.random() * lines.length)]
}

export function getYujiItadoriEventLine(quest: CommunityQuest | null): string {
	if (quest) {
		const timestampSeconds = Math.floor(quest.endDate.getTime() / 1000)
		return `Satoru Gojo has been sealed! We need to work together to unseal him. The community quest "${quest.questName}" is currently underway and will end on <t:${timestampSeconds}:f>. Let's do our best to complete the quest and bring Gojo back!`
	} else {
		return "Satoru Gojo has been sealed, but we don't have any information on how to unseal him yet. Stay tuned for updates!"
	}
}

export async function createTechniqueSelectMenu(
	participants: string[],
	countdown: number
): Promise<ActionRowBuilder<SelectMenuBuilder>[]> {
	const rows: ActionRowBuilder<SelectMenuBuilder>[] = []

	for (const participant of participants) {
		const userTechniques = await getUserTechniques(participant)
		const techniqueOptions = userTechniques.map(techniqueName => ({
			label: techniqueName,
			description: "Select to use this technique",
			value: techniqueName
		}))

		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId(`select-battle-option-${participant}`)
			.setPlaceholder(`Choose your technique (${countdown}s)`)
			.addOptions(techniqueOptions)

		const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(selectMenu)
		rows.push(row)
	}

	return rows
}

export async function createRaidEmbed(raidBoss, participants, interaction) {
	const primaryEmbed = new EmbedBuilder()
		.setColor("Aqua")
		.setTitle("Cursed Battle!")
		.setDescription(`You're facing **${raidBoss.name}**! Choose your technique wisely.`)
		.setImage(raidBoss.image_url)
		.addFields(
			{ name: "Boss Health", value: `:heart: ${raidBoss.current_health.toString()}`, inline: true },
			{ name: "Boss Grade", value: `${raidBoss.grade}`, inline: true },
			{ name: "Boss Awakening", value: `${raidBoss.awakeningStage}` || "None", inline: true }
		)
		.addFields({
			name: "Boss Health Status",
			value: generateHealthBar(raidBoss.current_health, raidBoss.globalHealth),
			inline: false
		})
		.addFields()

	// Add participants' health to the embed
	const participantsHealthFields = []
	for (const participant of participants) {
		const playerHealth = await getUserHealth(participant)
		participantsHealthFields.push({
			name: `${interaction.guild?.members.cache.get(participant)?.displayName || "Unknown"}`,
			value: `:blue_heart: ${playerHealth.toString()}`,
			inline: true
		})
	}
	primaryEmbed.addFields(...participantsHealthFields)

	if (raidBoss.awakeningStage === "Stage Five") {
		primaryEmbed.setFooter({ text: "Be careful, There's no information on this boss.." })
	}

	return primaryEmbed
}
