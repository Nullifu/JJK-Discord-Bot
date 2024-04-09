/* eslint-disable @typescript-eslint/no-unused-vars */

import { ActionRowBuilder, SelectMenuBuilder } from "@discordjs/builders"
import { CacheType, ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import { calculateDamage, getBossDrop, getRandomXPGain } from "./calculate.js"
import { activeCollectors } from "./command.js"
import { BossData } from "./interface.js"
import {
	addItemToUserInventory,
	addUserQuestProgress,
	getUserGrade,
	getUserMaxHealth,
	getUserUnlockedTransformations,
	removeAllStatusEffects,
	updateBalance,
	updatePlayerGrade,
	updateUserExperience,
	updateUserHealth,
	updateUserUnlockedTransformations
} from "./mongodb.js"

export async function handleBossDeath(
	interaction: ChatInputCommandInteraction<CacheType>,
	embed: EmbedBuilder,
	row: ActionRowBuilder<SelectMenuBuilder>,
	opponent: BossData
) {
	// Show victory embed
	const victoryMessage = "You won"
	embed.setDescription(victoryMessage)

	if (opponent.name === "Mahito Instant Spirit Body of Distorted Killing") {
		embed.setDescription("I admit it, Mahito i am you.")
		embed.setImage(
			"https://cdn.discordapp.com/attachments/681985000521990179/1222162641620041798/ezgif-2-cc9a6b6268.gif?ex=661536a8&is=6602c1a8&hm=591265d694ffde07b30eef7cfc538c2055643d8e349500cd4fd9be4484ffe4e7&f"
		)
	}

	await interaction.editReply({ embeds: [embed], components: [] })

	function getrandommoney(min = 25000, max = 50000) {
		return Math.floor(Math.random() * (max - min + 1)) + min
	}

	// Calculate experience they get
	const experienceGain = getRandomXPGain()
	const coinsGained = getrandommoney()

	if (opponent.name === "Hakari Kinji") {
		await addUserQuestProgress(interaction.user.id, "Gamblers Fever", 1)
	}
	if (opponent.name === "Itadori") {
		await addUserQuestProgress(interaction.user.id, "Training with Itadori", 1)
	}
	if (opponent.name === "Mahito Instant Spirit Body of Distorted Killing") {
		await addUserQuestProgress(interaction.user.id, "Nature of Curses", 1)
	}
	if (opponent.name === "Hakari (Jackpot)") {
		await addUserQuestProgress(interaction.user.id, "Gamblers Fever", 1)
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

	// Update values in the database
	activeCollectors.delete(interaction.user.id)
	await updateUserHealth(interaction.user.id, 100)
	await updateUserExperience(interaction.user.id, experienceGain)
	await updatePlayerGrade(interaction.user.id)
	await removeAllStatusEffects(interaction.user.id)

	// Show a loot drop embed & add to database
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

// Function to handle the execution of special techniques
export async function executeSpecialTechnique({
	collectedInteraction,
	techniqueName,
	damageMultiplier,
	imageUrl,
	description,
	fieldValue,
	userTechniques,
	userId,
	primaryEmbed
}) {
	const techniquesUsed = userTechniques.get(userId) || []
	techniquesUsed.push(techniqueName)
	userTechniques.set(userId, techniquesUsed) // Update the map with the new array

	const playerGradeData = await getUserGrade(collectedInteraction.user.id)
	const playerGradeString = playerGradeData

	// Technique hasn't been used, proceed
	techniquesUsed.push(techniqueName)
	userTechniques.set(userId, techniquesUsed) // Update the map with the new techniques list

	const damage = calculateDamage(playerGradeString, userId, true) * damageMultiplier

	primaryEmbed.setImage(imageUrl)
	primaryEmbed.setDescription(description)
	primaryEmbed.setFields({ name: "Technique", value: fieldValue })

	await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })
	await new Promise(resolve => setTimeout(resolve, 2000))

	return damage
}

export function generateHealthBar(current, max) {
	const totalBars = 10
	const filledBars = Math.round((current / max) * totalBars)
	const emptyBars = totalBars - filledBars
	return "▮".repeat(filledBars) + "▯".repeat(emptyBars)
}

interface FlavorText {
	name: string
	value: string
}

function getJujutsuFlavorText(bossName: string): FlavorText | null {
	if (bossName === "Sukuna") {
		return { name: "Sukuna says...", value: "Show me what you can do." }
	} else if (bossName === "Satoru Gojo") {
		return { name: "Gojo's Challenge", value: "Let's see if you're worthy." }
	} else if (bossName === "Itadori") {
		return { name: "Itadori's Determination", value: "I won't lose!" }
	} else if (bossName === "Aoi Todo & Itadori") {
		return { name: "Brotherly Bond", value: "Let's start cooking.. Brother" }
	} else if (bossName === "Megumi Fushiguro") {
		return { name: "Fushiguro's Willpower", value: "With this treasure.. I SUMMON" }
	} else if (bossName === "Zenin Toji") {
		return { name: "Heavenly Restriction", value: "Cursed since birth." }
	} else if (bossName === "Sukuna (Suppressed)") {
		return { name: "King of curses", value: "This will be over quickly." }
	} else if (bossName === "Jogo") {
		return { name: "Jogo's Challenge", value: "I'll burn you to a crisp." }
	} else if (bossName === "Mahito (Transfigured)") {
		return { name: "Mahito's Challenge", value: "I'll show you the true nature of the soul." }
	} else if (bossName === "Suguru Geto") {
		return { name: "Geto's Challenge", value: "Filthy Monkey" }
	} else if (bossName === "Dagon") {
		return { name: "Dagon's Instincts", value: "blorp blorg (fish noises)" }
	} else if (bossName === "Yuta") {
		return { name: "Yutas Curse", value: "Rika.." }
	} else if (bossName === "Finger Bearer") {
		return { name: "(curse noises)", value: "........." }
	}

	// Add a default case if you'd like
	return null
}

// handleTheHonoredOne if boss name is curse king he comes back to life with new name and max hp
export async function exportTheHonoredOne(interaction, randomOpponent, primaryEmbed, row, playerHealth) {
	const random = Math.random()

	// Initially, it seems like the boss is defeated
	if (random < 0.2) {
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

		await new Promise(resolve => setTimeout(resolve, 4000)) // 5 seconds delay

		const reawakeningEmbed = new EmbedBuilder()
			.setDescription("Yo... It's been awhile.")
			.addFields({
				name: "FOR REAL REAL IM STILL ALIVE AND KICKING!",
				value: "YOUR GOING TO LOSE BECAUSE YOU DIDNT USE THAT CURSE TOOL TO FINISH ME OFF"
			})
			.setImage("https://media1.tenor.com/m/c67XWC0HaEwAAAAC/gojo-toji.gif") // GIF of Gojo reawakening
			.setColor("#00FF00")

		await interaction.editReply({ embeds: [reawakeningEmbed], components: [] })

		await new Promise(resolve => setTimeout(resolve, 3000)) // 3 seconds delay

		randomOpponent.name = "The Honored One"
		randomOpponent.current_health = randomOpponent.max_health // Reset health to max
		const usermaxhealth = await getUserMaxHealth(interaction.user.id)

		await updateUserHealth(interaction.user.id, usermaxhealth) // Reset player health to max

		primaryEmbed
			.setDescription("Gojo Satoru has reawakened as The Honored One!")
			.setImage("https://media1.tenor.com/m/TQWrKGuC9GsAAAAC/gojo-satoru-the-honored-one.gif")
			.setFields(
				{ name: "Boss Health", value: randomOpponent.current_health.toString() },
				{ name: "Player Health", value: playerHealth.toString() }
			)

		// Update the message with the fight's continuation
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
		randomOpponent.current_health = randomOpponent.max_health // Reset health to max
		const usermaxhealth = getUserMaxHealth(interaction.user.id)

		await updateUserHealth(interaction.user.id, await usermaxhealth) // Reset player health to max

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
		randomOpponent.current_health = randomOpponent.max_health // Reset health to max
		const usermaxhealth = getUserMaxHealth(interaction.user.id)

		await updateUserHealth(interaction.user.id, await usermaxhealth) // Reset player health to max

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
		randomOpponent.current_health = randomOpponent.max_health // Reset health to max
		const usermaxhealth = getUserMaxHealth(interaction.user.id)

		await updateUserHealth(interaction.user.id, await usermaxhealth) // Reset player health to max

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
		// Check if the user has the 'Curse Queen' transformation unlocked
		const unlockedTransformations = await getUserUnlockedTransformations(interaction.user.id)

		if (!unlockedTransformations.includes("Curse Queen")) {
			await updateUserUnlockedTransformations(interaction.user.id, ["Curse Queen"])

			// Customize your message to indicate the new transformation has been unlocked
			primaryEmbed.setImage("https://i.ytimg.com/vi/dwdsYVRpocc/maxresdefault.jpg")
			primaryEmbed.setDescription(
				`${interaction.user.username} You're pretty strong... I'll lend you some of my power. Unlocked the **Curse Queen** transformation!`
			)
			await interaction.editReply({ embeds: [primaryEmbed] })
			return true
		} else {
			// If they already have the transformation, proceed as normal
			primaryEmbed.setDescription("Rika.. Lend me your strength. **CURSE QUEEN RIKA HAS JOINED THE BATTLE!**")
		}

		// Reset health for both the opponent and player
		randomOpponent.current_health = randomOpponent.max_health // Reset opponent's health to max
		const userMaxHealth = await getUserMaxHealth(interaction.user.id)
		await updateUserHealth(interaction.user.id, userMaxHealth) // Reset player's health to max

		// Set the image and health fields in the embed
		primaryEmbed.setImage("https://media1.tenor.com/m/BhgnUENmzrkAAAAC/jujutsu-kaisen0-yuta-okkotsu.gif")
		primaryEmbed.setFields(
			{ name: "Boss Health", value: randomOpponent.current_health.toString() },
			{ name: "Player Health", value: playerHealth.toString() }
		)

		// Send the updated reply
		await interaction.editReply({ embeds: [primaryEmbed], components: [row] })

		return true
	}

	return false // If the battle doesn't result in defeating Yuta, continue with existing logic
}

export async function exportCrashOut(interaction, randomOpponent, primaryEmbed, row, playerHealth) {
	const random = Math.random()
	if (random < 0.4) {
		randomOpponent.name = "Mahoraga"
		randomOpponent.current_health = randomOpponent.max_health // Reset health to max
		const usermaxhealth = getUserMaxHealth(interaction.user.id)

		await updateUserHealth(interaction.user.id, await usermaxhealth) // Reset player health to max

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
		randomOpponent.current_health = randomOpponent.max_health // Reset health to max
		const usermaxhealth = getUserMaxHealth(interaction.user.id)

		await updateUserHealth(interaction.user.id, await usermaxhealth) // Reset player health to max

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
		randomOpponent.current_health = randomOpponent.max_health // Reset health to max
		const usermaxhealth = getUserMaxHealth(interaction.user.id)

		await updateUserHealth(interaction.user.id, await usermaxhealth) // Reset player health to max

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
		randomOpponent.current_health = randomOpponent.max_health // Reset health to max
		const usermaxhealth = getUserMaxHealth(interaction.user.id)

		await updateUserHealth(interaction.user.id, await usermaxhealth) // Reset player health to max

		primaryEmbed.setDescription(
			`BROTHER! This cursed spirit successfully used Black Flash, now the person whos' left behind is me. You have become stronger, ${interaction.user.username} Are you willing to maintain the status quo, AOI TODO? ARE YOU GOING TO LEAVE ${interaction.user.username} ALONE AGAIN, AOI TODO? **KOKUSEN!**`
		)
		primaryEmbed.setImage("https://media1.tenor.com/m/Y1BZYqq9NVoAAAAd/todo-black-flash-jujutsu-kaisen.gif")
		primaryEmbed.setFields({ name: "Boss Health", value: "???" }, { name: "Player Health", value: "???" })
		//
		await interaction.editReply({ embeds: [primaryEmbed], components: [row] })

		await new Promise(resolve => setTimeout(resolve, 4000)) // 3 seconds delay

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
	await updateUserHealth(interaction.user.id, userMaxHealth) // Reset player health to max
	//
	randomOpponent.name = "Mahito"
	randomOpponent.current_health = randomOpponent.max_health // Reset health to max

	// Customize the message and image for Aoi Todo's revival
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

	await new Promise(resolve => setTimeout(resolve, 5000)) // 3 seconds delay

	// Customize the message and image for Aoi Todo's revival
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
		components: row ? [row] : [] // Ensure row exists, otherwise pass an empty array
	})
}

export { getJujutsuFlavorText }
