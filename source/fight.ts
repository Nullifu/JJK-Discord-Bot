/* eslint-disable @typescript-eslint/no-unused-vars */

import { ActionRowBuilder, ButtonBuilder, SelectMenuBuilder } from "@discordjs/builders"
import { ButtonStyle, CacheType, ChatInputCommandInteraction, ComponentType, EmbedBuilder } from "discord.js"
import { calculateDamage, getBossDrop, getRandomXPGain } from "./calculate.js"
import { activeCollectors } from "./command.js"
import { BossData } from "./interface.js"
import {
	addItemToUserInventory,
	addUserQuestProgress,
	getUserGrade,
	getUserMaxHealth,
	getUserShikigami,
	getUserUnlockedTransformations,
	removeAllStatusEffects,
	updateBalance,
	updateMonthlyFightsWon,
	updatePlayerGrade,
	updateUserExperience,
	updateUserFightsWon,
	updateUserHealth,
	updateUserShikigami,
	updateUserUnlockedTransformations
} from "./mongodb.js"

export async function handleBossDeath(
	interaction: ChatInputCommandInteraction<CacheType>,
	embed: EmbedBuilder,
	row: ActionRowBuilder<SelectMenuBuilder>,
	opponent: BossData
) {
	const victoryMessage = "You won"
	embed.setDescription(victoryMessage)

	if (opponent.name === "Mahito Instant Spirit Body of Distorted Killing") {
		embed.setDescription("I admit it, Mahito i am you.")
		embed.setImage("https://storage.googleapis.com/jjk_bot_personal/yuji-snow-mahito-snow.gif")
	}

	await interaction.editReply({ embeds: [embed], components: [] })

	function getrandommoney(min = 25000, max = 50000) {
		return Math.floor(Math.random() * (max - min + 1)) + min
	}

	const experienceGain = getRandomXPGain()
	const coinsGained = getrandommoney()

	if (opponent.name === "Hakari Kinji") {
		await addUserQuestProgress(interaction.user.id, "Gamblers Fever", 1)
		await addUserQuestProgress(interaction.user.id, "Kashimo's Task", 1, "Defeat Hakari Kinji")
	}
	if (opponent.name === "Satoru Gojo") {
		await addUserQuestProgress(interaction.user.id, "Satoru Gojo's Mission", 1, "Defeat Gojo")
		await addUserQuestProgress(interaction.user.id, "Kashimo's Task", 1, "Defeat Gojo")
	}
	if (opponent.name === "Sukuna") {
		await addUserQuestProgress(interaction.user.id, "Satoru Gojo's Mission", 1, "Defeat Sukuna")
		await addUserQuestProgress(interaction.user.id, "Awakening", 1, "Defeat Ryomen Sukuna")
		await addUserQuestProgress(interaction.user.id, "Mentor: The Strongest", 1)
		await addUserQuestProgress(interaction.user.id, "Mentor: Curse King", 1)
		await addUserQuestProgress(interaction.user.id, "Kashimo's Task", 1, "Defeat Sukuna")
	}
	if (opponent.name === "Itadori") {
		await addUserQuestProgress(interaction.user.id, "Training with Itadori", 1)
	}
	if (opponent.name === "Mahito Instant Spirit Body of Distorted Killing") {
		await addUserQuestProgress(interaction.user.id, "Nature of Curses", 1)
	}
	if (opponent.name === "Hakari (Jackpot)") {
		await addUserQuestProgress(interaction.user.id, "Gamblers Fever", 1)
		await addUserQuestProgress(interaction.user.id, "Kashimo's Task", 1, "Defeat Hakari Kinji")
	}
	if (opponent.name === "Dagon") {
		await addUserQuestProgress(interaction.user.id, "Disaster Curses", 1, "Defeat Dagon")
	}
	if (opponent.name === "Jogo") {
		await addUserQuestProgress(interaction.user.id, "Disaster Curses", 1, "Defeat Jogo")
	}
	if (opponent.name === "Hanami") {
		await addUserQuestProgress(interaction.user.id, "Disaster Curses", 1, "Defeat Hanami")
	}
	if (opponent.name === "Yuji Itadori (Awoken)") {
		await addUserQuestProgress(interaction.user.id, "Awakening", 1, "Defeat Defeat Yuji Itadori (Awoken)")
		await addUserQuestProgress(
			interaction.user.id,
			"Stage Three Unleashed",
			1,
			"Defeat Yuji Itadori (Awoken)" || "Yuji Itadori (Awoken)"
		)
	}
	if (opponent.name === "Satoru Gojo (Shinjuku Showdown Arc)") {
		await addUserQuestProgress(
			interaction.user.id,
			"Stage Three Unleashed",
			1,
			"Satoru Gojo (Shinjuku Showdown Arc)" ||
				" Defeat Satoru Gojo (Shinjuku Showdown Arc)" ||
				"Defeat Satoru Gojo (Shinjuku Showdown Arc)"
		)
	}

	activeCollectors.delete(interaction.user.id)
	await updateUserHealth(interaction.user.id, 100)
	await updateUserExperience(interaction.user.id, experienceGain)
	await updatePlayerGrade(interaction.user.id)
	await removeAllStatusEffects(interaction.user.id)
	//
	await addUserQuestProgress(interaction.user.id, "Awakening", 1, "Defeat Foes")
	await addUserQuestProgress(interaction.user.id, "Satoru Gojo's Mission", 1, "Training")
	await addUserQuestProgress(interaction.user.id, "Nanami's Task", 1)
	await addUserQuestProgress(interaction.user.id, "Kashimo's Task", 1, "Defeat Foes")
	//
	await updateUserFightsWon(interaction.user.id)
	await updateMonthlyFightsWon(interaction.user.id)

	const drop = getBossDrop(opponent.name)
	await addItemToUserInventory(interaction.user.id, drop.name, 1)
	await updateBalance(interaction.user.id, coinsGained)
	const privateEmbed = new EmbedBuilder()
		.setColor("#0099ff")
		.setTitle("Battle Rewards")
		.addFields(
			{ name: "Loot Drop", value: `You've also found a ${drop.name} among the remains!` },
			{ name: "Experience Gained", value: `You've gained ${experienceGain} XP for defeating the boss!` },
			{ name: "Coins Gained", value: `You've gained ${coinsGained} Coins for defeating the boss!` }
		)
	await interaction.followUp({ embeds: [privateEmbed], ephemeral: true })
}

export async function handleShikigamiTame(
	interaction: ChatInputCommandInteraction<CacheType>,
	embed: EmbedBuilder,
	row: ActionRowBuilder<SelectMenuBuilder>,
	opponent: BossData
) {
	interface UserShikigami {
		name: string
		experience: number
		health: number
		tier: number
		tamedAt: Date
		hygiene: number
		hunger: number
		friendship: number
	}
	const victoryMessage = "You won"
	embed.setDescription(victoryMessage)
	const drop = getBossDrop(opponent.name)

	activeCollectors.delete(interaction.user.id)
	await updateUserHealth(interaction.user.id, 100)
	await addItemToUserInventory(interaction.user.id, drop.name, 1)
	await removeAllStatusEffects(interaction.user.id)

	let tamedShikigami: UserShikigami

	if (opponent.name === "Divine-General Mahoraga") {
		tamedShikigami = {
			name: "Divine-General Mahoraga",
			experience: 0,
			tier: 5,
			health: 500,
			tamedAt: new Date(),
			hygiene: 100,
			hunger: 100,
			friendship: 0
		}
	} else {
		tamedShikigami = {
			name: opponent.name,
			experience: 0,
			tier: 5,
			health: opponent.name === "Mahoraga" ? 400 : 100,
			tamedAt: new Date(),
			hygiene: 100,
			hunger: 100,
			friendship: 0
		}
	}

	const userShikigami = await getUserShikigami(interaction.user.id)

	const hasShikigami = userShikigami.some(shikigami => shikigami.name === tamedShikigami.name)

	const privateEmbed = new EmbedBuilder().setColor("#0099ff").setTitle("Battle Rewards")

	if (!hasShikigami) {
		await updateUserShikigami(interaction.user.id, tamedShikigami)
		privateEmbed.addFields({ name: "Tamed", value: `You've tamed ${opponent.name}!` })
	} else {
		privateEmbed.addFields({
			name: "Already Tamed",
			value: `You already have ${opponent.name} in your collection!`
		})
	}

	await interaction.followUp({ embeds: [privateEmbed], ephemeral: true })
}

export async function executeSpecialTechnique({
	collectedInteraction,
	techniqueName,
	damageMultiplier,
	imageUrl,
	description,
	fieldValue,
	userTechniques: userTechniquesFight,
	userId,
	primaryEmbed
}) {
	const techniquesUsed = userTechniquesFight.get(userId) || []
	techniquesUsed.push(techniqueName)
	userTechniquesFight.set(userId, techniquesUsed)

	const playerGradeData = await getUserGrade(collectedInteraction.user.id)
	const playerGradeString = playerGradeData

	// Technique hasn't been used, proceed
	techniquesUsed.push(techniqueName)
	userTechniquesFight.set(userId, techniquesUsed)

	const damage = calculateDamage(playerGradeString, userId, true) * damageMultiplier

	primaryEmbed.setImage(imageUrl)
	primaryEmbed.setDescription(description)
	primaryEmbed.setFields({ name: "Technique", value: fieldValue })

	await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })
	await new Promise(resolve => setTimeout(resolve, 3000))

	return damage
}

export function generateHealthBar(current, max) {
	const totalBars = 10
	const filledBars = Math.round((current / max) * totalBars)
	const emptyBars = totalBars - filledBars
	return "▮".repeat(filledBars) + "▯".repeat(emptyBars)
}

export async function exportTheHonoredOne(interaction, randomOpponent, primaryEmbed, row, playerHealth) {
	const random = Math.random()

	if (random < 0.4) {
		const fakeDeathEmbed = new EmbedBuilder()
			.setTitle("You won!")
			.setColor("#0099ff")
			.setTitle("Battle Rewards")
			.addFields(
				{ name: "Loot Drop", value: "You've also found a..." },
				{ name: "Experience Gained", value: "You've gained ^$&\"!*$ XP for defeating the boss!" },
				{ name: "Coins Gained", value: "You've gained 00000 Coins for defeating the boss!" },
				{ name: "*%$£!!£", value: "Something seems off.." }
			)
		await interaction.editReply({ embeds: [fakeDeathEmbed], components: [] })

		await new Promise(resolve => setTimeout(resolve, 4000))

		const reawakeningEmbed = new EmbedBuilder()
			.setDescription("Yo... It's been awhile.")
			.addFields({
				name: "FOR REAL REAL IM STILL ALIVE AND KICKING!",
				value: "YOUR GOING TO LOSE BECAUSE YOU DIDNT USE THAT CURSE TOOL TO FINISH ME OFF"
			})
			.setImage("https://media1.tenor.com/m/c67XWC0HaEwAAAAC/gojo-toji.gif")
			.setColor("#00FF00")

		await interaction.editReply({ embeds: [reawakeningEmbed], components: [] })

		await new Promise(resolve => setTimeout(resolve, 3000))

		randomOpponent.name = "The Honored One"
		randomOpponent.current_health = randomOpponent.max_health
		const usermaxhealth = await getUserMaxHealth(interaction.user.id)

		await updateUserHealth(interaction.user.id, usermaxhealth)

		primaryEmbed
			.setDescription("Gojo Satoru has reawakened as The Honored One!")
			.setImage("https://media1.tenor.com/m/TQWrKGuC9GsAAAAC/gojo-satoru-the-honored-one.gif")
			.setFields(
				{ name: "Boss Health", value: randomOpponent.current_health.toString() },
				{ name: "Player Health", value: playerHealth.toString() }
			)

		await interaction.editReply({ embeds: [primaryEmbed], components: [row] })

		return true
	}
	return false
}

// Return false to indicate no transformation occurred

export async function exportTheCursedOne(interaction, randomOpponent, primaryEmbed, row, playerHealth) {
	const random = Math.random()
	if (random < 0.5) {
		randomOpponent.name = "Sukuna (Heian Era)"
		randomOpponent.current_health = randomOpponent.max_health // Reset health to max
		const usermaxhealth = getUserMaxHealth(interaction.user.id)

		await updateUserHealth(interaction.user.id, await usermaxhealth) // Reset player health to max

		primaryEmbed.setDescription("Sukuna has unleashed his full power as Sukuna (Heian Era)!")
		primaryEmbed.setImage("https://staticg.sportskeeda.com/editor/2024/01/dd442-17050432242946-1920.jpg")
		primaryEmbed.setFields(
			{ name: "Boss Health", value: randomOpponent.current_health.toString() },
			{ name: "Player Health", value: playerHealth.toString() }
		)

		await interaction.editReply({ embeds: [primaryEmbed], components: [row] })

		return true
	}
	return false
}
export async function exportGambler(interaction, randomOpponent, primaryEmbed, row, playerHealth) {
	const random = Math.random()
	if (random < 0.7) {
		randomOpponent.name = "Hakari (Jackpot)"
		randomOpponent.current_health = randomOpponent.max_health
		const usermaxhealth = getUserMaxHealth(interaction.user.id)

		await updateUserHealth(interaction.user.id, await usermaxhealth)

		primaryEmbed.setDescription("Hakari has entered jackpot mode!")
		primaryEmbed.setImage("https://media1.tenor.com/m/Rpk3q-OLFeYAAAAC/hakari-dance-hakari.gif")
		primaryEmbed.setFields(
			{ name: "Boss Health", value: randomOpponent.current_health.toString() },
			{ name: "Player Health", value: playerHealth.toString() }
		)

		await interaction.editReply({ embeds: [primaryEmbed], components: [row] })

		return true
	}
	return false
}

// Return false to indicate no transformation occurred

export async function exportTheFraud(interaction, randomOpponent, primaryEmbed, row, playerHealth) {
	const random = Math.random()
	if (random < 0.4) {
		randomOpponent.name = "Sukuna (Suppressed)"
		randomOpponent.current_health = randomOpponent.max_health
		const usermaxhealth = getUserMaxHealth(interaction.user.id)

		await updateUserHealth(interaction.user.id, await usermaxhealth)

		primaryEmbed.setDescription(
			"Hmph, pathetic brat. Look at the state you've gotten yourself into, **SUKUNA HAS TAKEN OVER YUJI ITADORI'S BODY AND IS NOW IN CONTROL! DEFEAT HIM BEFORE HE FULLY TAKES OVER**"
		)
		primaryEmbed.setImage(
			"https://cdn.discordapp.com/attachments/1186763190835613748/1226436754970640405/ezgif-5-83a420d6b1.gif?ex=6624c33c&is=66124e3c&hm=8f8b3de15fabf874eada713edce48052e0579fd414dee8398c65b0bf20802cc3&"
		)
		primaryEmbed.setFields(
			{ name: "Boss Health", value: randomOpponent.current_health.toString() },
			{ name: "Player Health", value: playerHealth.toString() }
		)

		await interaction.editReply({ embeds: [primaryEmbed], components: [row] })

		return true
	}
	return false
}
export async function exportReincarnation(interaction, randomOpponent, primaryEmbed, row, playerHealth) {
	const random = Math.random()
	if (random < 0.5) {
		randomOpponent.name = "Zenin Toji (Reincarnated)"
		randomOpponent.current_health = randomOpponent.max_health
		const usermaxhealth = getUserMaxHealth(interaction.user.id)

		await updateUserHealth(interaction.user.id, await usermaxhealth)

		primaryEmbed.setDescription(
			"Those who inherited the curse of the Zen'in family… The one who couldn't fully leave behind that curse… They would all bear witness to the bare flesh of the one who is free… To the one.. Who stands before you with this curse."
		)
		primaryEmbed.setImage("https://media1.tenor.com/m/DrFCvWACEmgAAAAC/toji-toji-fushiguro.gif")
		primaryEmbed.setFields(
			{ name: "Boss Health", value: randomOpponent.current_health.toString() },
			{ name: "Player Health", value: playerHealth.toString() }
		)

		await interaction.editReply({ embeds: [primaryEmbed], components: [row] })

		return true
	}
	return false
}
export async function exportRika(interaction, randomOpponent, primaryEmbed, row, playerHealth) {
	const random = Math.random()
	if (random < 0.7) {
		const unlockedTransformations = await getUserUnlockedTransformations(interaction.user.id)

		if (!unlockedTransformations.includes("Curse Queen")) {
			await updateUserUnlockedTransformations(interaction.user.id, ["Curse Queen"])

			primaryEmbed.setImage("https://i.ytimg.com/vi/dwdsYVRpocc/maxresdefault.jpg")
			primaryEmbed.setDescription(
				`${interaction.user.username} You're pretty strong... I'll lend you some of my power. Unlocked the **Curse Queen** transformation!`
			)
			await interaction.editReply({ embeds: [primaryEmbed] })
			return true
		} else {
			randomOpponent.name = "Yuta Okkotsu (Rika)"
			randomOpponent.current_health = randomOpponent.max_healt
			const userMaxHealth = await getUserMaxHealth(interaction.user.id)
			await updateUserHealth(interaction.user.id, userMaxHealth)

			primaryEmbed.setImage("https://media1.tenor.com/m/BhgnUENmzrkAAAAC/jujutsu-kaisen0-yuta-okkotsu.gif")
			primaryEmbed.setDescription("Rika.. Lend me your strength. **CURSE QUEEN RIKA HAS JOINED THE BATTLE!**")
			primaryEmbed.setFields(
				{ name: "Boss Health", value: randomOpponent.current_health.toString() },
				{ name: "Player Health", value: playerHealth.toString() }
			)

			await interaction.editReply({ embeds: [primaryEmbed], components: [row] })

			return true
		}
	}

	return false
}

export async function exportCrashOut(interaction, randomOpponent, primaryEmbed, row, playerHealth) {
	const random = Math.random()
	if (random < 0.4) {
		randomOpponent.name = "Mahoraga"
		randomOpponent.current_health = randomOpponent.max_health
		const usermaxhealth = getUserMaxHealth(interaction.user.id)

		await updateUserHealth(interaction.user.id, await usermaxhealth)

		primaryEmbed.setDescription(`Hey ${interaction.user.username}.. I'll be dying first. Give it your best shot...`)
		primaryEmbed.setImage("https://media1.tenor.com/m/mC0Tc7Xm7iUAAAAC/megumi-megumifushiguro.gif")
		primaryEmbed.setFields(
			{ name: "Boss Health", value: randomOpponent.current_health.toString() },
			{ name: "Player Health", value: playerHealth.toString() }
		)

		await interaction.editReply({ embeds: [primaryEmbed], components: [row] })

		return true
	}
	return false
}

export async function exportSukuna2(interaction, randomOpponent, primaryEmbed, row, playerHealth) {
	const random = Math.random()
	if (random < 0.3) {
		randomOpponent.name = "Sukuna Full Power"
		randomOpponent.current_health = randomOpponent.max_health
		const usermaxhealth = getUserMaxHealth(interaction.user.id)

		await updateUserHealth(interaction.user.id, await usermaxhealth)

		primaryEmbed.setDescription(
			`HAHHAHAHAHAHAHAHAHAHAHAH YOU CAN SEE IT ${interaction.user.username}! YOU CAN SEE MY CURSED TECHNIQUE!`
		)
		primaryEmbed.setImage("https://media1.tenor.com/m/I1g7hhwKGbkAAAAd/sukuna-ryomen.gif")
		primaryEmbed.setFields(
			{ name: "SUKUNA HAS ENTERED STAGE TWO!", value: "" },
			{ name: "Boss Health", value: randomOpponent.current_health.toString() },
			{ name: "Player Health", value: playerHealth.toString() }
		)

		await interaction.editReply({ embeds: [primaryEmbed], components: [row] })

		return true
	}
	return false
}
export async function exportMahito(interaction, randomOpponent, primaryEmbed, row, playerHealth) {
	const random = Math.random()
	if (random < 0.3) {
		randomOpponent.name = "Mahito Instant Spirit Body of Distorted Killing"
		randomOpponent.current_health = randomOpponent.max_health
		const usermaxhealth = getUserMaxHealth(interaction.user.id)

		await updateUserHealth(interaction.user.id, await usermaxhealth)

		primaryEmbed.setDescription("Ahhh the nature of the soul TRULY FASCINATING!")
		primaryEmbed.setImage("https://media1.tenor.com/m/1tna9DzZLccAAAAd/jjk-jujutsu-kaisen.gif")
		primaryEmbed.setFields(
			{ name: "Boss Health", value: randomOpponent.current_health.toString() },
			{ name: "Player Health", value: playerHealth.toString() }
		)

		await interaction.editReply({ embeds: [primaryEmbed], components: [row] })

		return true
	}
	return false
}

export async function export120(interaction, randomOpponent, primaryEmbed, row, playerHealth) {
	const random = Math.random()
	if (random < 0.9) {
		randomOpponent.name = "Mahito (120%)"
		randomOpponent.current_health = randomOpponent.max_health
		const usermaxhealth = getUserMaxHealth(interaction.user.id)

		await updateUserHealth(interaction.user.id, await usermaxhealth)

		primaryEmbed.setDescription(
			`BROTHER! This cursed spirit successfully used Black Flash, now the person whos' left behind is me. You have become stronger, ${interaction.user.username} Are you willing to maintain the status quo, AOI TODO? ARE YOU GOING TO LEAVE ${interaction.user.username} ALONE AGAIN, AOI TODO? **KOKUSEN!**`
		)
		primaryEmbed.setImage("https://media1.tenor.com/m/Y1BZYqq9NVoAAAAd/todo-black-flash-jujutsu-kaisen.gif")
		primaryEmbed.setFields({ name: "Boss Health", value: "???" }, { name: "Player Health", value: "???" })
		//
		await interaction.editReply({ embeds: [primaryEmbed], components: [row] })

		await new Promise(resolve => setTimeout(resolve, 4000))

		primaryEmbed.setDescription("However, from now on, all three of them... have reached 120% of their potential.")
		primaryEmbed.setImage("https://media1.tenor.com/m/oydgFq051r8AAAAC/todo-itadori.gif")
		primaryEmbed.setFields(
			{ name: "Boss Health", value: randomOpponent.current_health.toString() },
			{ name: "Player Health", value: playerHealth.toString() }
		)

		await interaction.editReply({ embeds: [primaryEmbed], components: [row] })

		return true
	}
	return false
}

export async function handlePlayerRevival(interaction, primaryEmbed, row, randomOpponent, playerHealth) {
	const userMaxHealth = await getUserMaxHealth(interaction.user.id)
	//
	await updateUserHealth(interaction.user.id, userMaxHealth)
	//
	randomOpponent.name = "Mahito"
	randomOpponent.current_health = randomOpponent.max_health

	primaryEmbed.setDescription(
		"My power reveals a fascinating truth... the shape of the soul, the essence of a curse. Perhaps I embody it all!"
	)
	primaryEmbed.setImage("https://media1.tenor.com/m/z3Itmn4rSLUAAAAd/jujutsu-kaisen-shibuya-arc-mahito.gif")

	primaryEmbed.setFields(
		{
			name: "Enemys Technique",
			value: "Mahito (Transfigured) dealt **?$!~@:!12** damage to you with Black FLASH!"
		},
		{ name: "Player Health", value: "????????" }
	)

	await interaction.editReply({
		embeds: [primaryEmbed]
	})

	await new Promise(resolve => setTimeout(resolve, 5000))

	primaryEmbed.setDescription(
		"The sound of the Gion Shoja bells... echoes the impermanence of all things. The color of the sala flowers...reveals the truth the prosperous must decline. But, we are the exceptions. \n\n**Get up, brother! Our battle is just beginning!**"
	)
	primaryEmbed.setImage("https://media1.tenor.com/m/pZsZJOyat-AAAAAC/todo-jjk.gif")

	primaryEmbed.setFields(
		{ name: "AOI TODO JOINS THE FIGHT", value: `Let's do this, ${interaction.user.username}` },
		{ name: "Boss Health", value: randomOpponent.current_health.toString() },
		{ name: "Player Health", value: playerHealth.toString() }
	)

	await interaction.editReply({
		embeds: [primaryEmbed],
		components: row ? [row] : []
	})
}

export async function handleJoyBoyDeath(interaction, primaryEmbed, row, randomOpponent, playerHealth) {
	const userMaxHealth = await getUserMaxHealth(interaction.user.id)
	//
	await updateUserHealth(interaction.user.id, userMaxHealth) // Reset player health to max
	//

	primaryEmbed.setDescription(`This fight is far from over, ${randomOpponent.name}..`)
	primaryEmbed.setImage("https://media1.tenor.com/m/Q9E7kfKz9CsAAAAd/ultra-instinct-ultra-instinct-goku.gif")

	await interaction.editReply({
		embeds: [primaryEmbed],
		components: [row]
	})
}

const gifs = [
	"https://media1.tenor.com/m/O7x4NwNSGx0AAAAC/jjk.gif",
	"https://media1.tenor.com/m/hQd_-MwNT5AAAAAd/jjk-jujutsu-kaisen.gif",
	"https://media1.tenor.com/m/BgnNBMz5pFAAAAAC/jujutsu-kaisen-shibuya-arc-itadori-shibuya-arc.gif"
]

const buttonLabels = ["Black.. FLASH!", "KOKU...SEN", "CONSECUTIVE BLACK FLASH!"]

const descriptions = [
	"Harness cursed energy for a devastating Black Flash!",
	"Amplify your attack, feel the surge of cursed energy!",
	"Execute the perfect Black Flash, overwhelming your foe!"
]

export async function executeBlackFlash({
	imageUrl,
	description,
	fieldValue,
	collectedInteraction,
	techniqueName,
	damageMultiplier,
	userTechniques,
	userId,
	primaryEmbed
}) {
	const techniquesUsed = userTechniques.get(userId) || []
	if (techniquesUsed.includes(techniqueName)) {
		await collectedInteraction.followUp({
			content: "You have already used Black Flash in this session.",
			ephemeral: true
		})
		return
	}

	techniquesUsed.push(techniqueName)
	userTechniques.set(userId, techniquesUsed)

	const playerGradeData = await getUserGrade(collectedInteraction.user.id)
	const playerGradeString = playerGradeData

	let attempts = 0
	const maxAttempts = 3
	let damage = 0

	async function attemptBlackFlash() {
		primaryEmbed.setImage(gifs[attempts % gifs.length])
		primaryEmbed.setDescription(descriptions[attempts % descriptions.length])
		primaryEmbed.setFields([{ name: techniqueName, value: `Attempt ${attempts + 1} of ${maxAttempts}` }])

		const button = new ButtonBuilder()
			.setCustomId(`again-${attempts}`)
			.setLabel(buttonLabels[attempts % buttonLabels.length])
			.setStyle(ButtonStyle.Primary)

		const row = new ActionRowBuilder().addComponents(button)

		await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })

		const filter = i => i.customId === `again-${attempts}` && i.user.id === collectedInteraction.user.id
		try {
			const response = await collectedInteraction.channel.awaitMessageComponent({
				filter,
				componentType: ComponentType.Button,
				time: 5000
			})

			await response.deferUpdate()

			attempts++
			if (attempts < maxAttempts) {
				await attemptBlackFlash()
			} else {
				damage = calculateDamage(playerGradeString, userId, true) * damageMultiplier
				await finishBlackFlash()
			}
		} catch (error) {
			damage = calculateDamage(playerGradeString, userId, true) * damageMultiplier
			await finishBlackFlash()
		}
	}

	async function finishBlackFlash() {
		primaryEmbed.setDescription(`${techniqueName} completed. Total damage: ${damage}`)
		await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })
	}

	await attemptBlackFlash()

	return damage
}

export function generateBloodlustBar(currentBloodlust) {
	const bloodlustBarLength = 20
	const maxBloodlust = 50
	const filledLength = Math.round((currentBloodlust / maxBloodlust) * bloodlustBarLength)
	const emptyLength = bloodlustBarLength - filledLength

	const filledBar = "🟥".repeat(filledLength)
	const emptyBar = "⬛".repeat(emptyLength)

	return `${filledBar}${emptyBar} (${currentBloodlust}/100)`
}
