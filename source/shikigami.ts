import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js"
import { attacks } from "./attacks.js"
import { logger } from "./bot.js"
import { createBar, shikigamiThumbnails } from "./interface.js"
import { getUserShikigami, increaseBond, updateShikigamiHealth } from "./mongodb.js"
import { applyStatusEffect, calculateDamageWithEffects } from "./statuseffects.js"

export const activeShikigami = new Map()
export const summonedShikigami = new Map()

export function updateShikigamiField(primaryEmbed, activeShikigami, userId) {
	if (!primaryEmbed.fields) {
		primaryEmbed.fields = []
	}

	const shikigamiFieldIndex = primaryEmbed.fields.findIndex(field => field.name === "Shikigami")

	const userShikigami = activeShikigami ? activeShikigami.get(userId) : []

	if (userShikigami && userShikigami.length > 0) {
		const shikigamiValue = userShikigami.join("\n")

		if (shikigamiFieldIndex !== -1) {
			primaryEmbed.fields[shikigamiFieldIndex].value = shikigamiValue
		} else {
			primaryEmbed.addFields({ name: "Shikigami", value: shikigamiValue, inline: false })
		}
	} else {
		if (shikigamiFieldIndex !== -1) {
			primaryEmbed.fields.splice(shikigamiFieldIndex, 1)
		}
	}

	const shikigamiFields = primaryEmbed.fields.filter(field => field.name === "Shikigami")
	if (shikigamiFields.length > 1) {
		primaryEmbed.fields = primaryEmbed.fields.filter(field => field.name !== "Shikigami")
		primaryEmbed.addFields(shikigamiFields[0])
	}
}

export async function executeMahoraga({
	collectedInteraction,
	shikigamiName,
	techniqueName,
	fieldValue,
	userTechniques: userTechniquesFight,
	userId,
	primaryEmbed,
	bossHealthMap,
	playerHealth,
	randomOpponent,
	row
}): Promise<number | { damage: number; userTechniques: Map<string, unknown> }> {
	summonedShikigami.set(userId, shikigamiName)
	//
	primaryEmbed.setImage("https://media1.tenor.com/m/sbiTK_XDYoUAAAAC/sukuna-mahoraga.gif")
	//
	await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })

	const techniquesUsed = userTechniquesFight.get(userId) || []
	techniquesUsed.push(techniqueName)
	userTechniquesFight.set(userId, techniquesUsed)

	if (techniqueName === "Ten Shadows Technique: Divergent Sila Divine General Mahoraga") {
		const userShikigami = await getUserShikigami(collectedInteraction.user.id)

		const hasMahoraga = userShikigami.some(shikigami => shikigami.name === "Mahoraga" || "Divine-General Mahoraga")

		if (hasMahoraga) {
			await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })
			await new Promise(resolve => setTimeout(resolve, 3000))

			const mahoragaAdaptation = userTechniquesFight.get(`${userId}_mahoraga_adaptation`) || 0
			userTechniquesFight.set(`${userId}_mahoraga_adaptation`, mahoragaAdaptation + 1)

			const enemyDamage = Math.floor(Math.random() * 100) + 50
			const currentBossHealth = bossHealthMap.get(userId) || randomOpponent.max_health
			const newBossHealth = Math.max(0, currentBossHealth - enemyDamage)
			bossHealthMap.set(userId, newBossHealth)
			randomOpponent.current_health = newBossHealth

			primaryEmbed.setImage("https://media1.tenor.com/m/sFvgffc0uM8AAAAC/season-2-jujutsu-kaisen.gif")
			primaryEmbed.setFields({
				name: "Mahoraga's Opening Attack",
				value: `Mahoraga is summoned and begins to adapt to the enemy's technique! The enemy takes ${enemyDamage} damage.`,
				inline: true
			})

			await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })

			await new Promise(resolve => setTimeout(resolve, 3000))

			return { damage: enemyDamage, userTechniques: userTechniquesFight }
		} else {
			const confirmationEmbed = new EmbedBuilder()
				.setTitle("Summon Mahoraga")
				.setDescription("You don't have Mahoraga tamed. Do you want to take a risk and summon him anyway?")
				.setColor("#FF0000")

			const confirmationRow = new ActionRowBuilder().addComponents(
				new ButtonBuilder().setCustomId("confirm_summon").setLabel("Summon").setStyle(ButtonStyle.Danger),
				new ButtonBuilder().setCustomId("cancel_summon").setLabel("Cancel").setStyle(ButtonStyle.Secondary)
			)
			await collectedInteraction.followUp({
				embeds: [confirmationEmbed],
				components: [confirmationRow],
				ephemeral: true
			})

			const confirmationCollector = collectedInteraction.channel.createMessageComponentCollector({
				filter: i => i.user.id === collectedInteraction.user.id,
				time: 15000,
				max: 1
			})

			const confirmationResult = await new Promise(resolve => {
				confirmationCollector.on("collect", async i => {
					if (i.customId === "confirm_summon") {
						await i.update({
							content: "You decided to summon Mahoraga. Brace yourself!",
							embeds: [],
							components: []
						})
						resolve(true)
					} else if (i.customId === "cancel_summon") {
						await i.update({
							content: "You decided not to summon Mahoraga.",
							embeds: [],
							components: []
						})
						resolve(false)
					}
				})

				confirmationCollector.on("end", async collected => {
					if (collected.size === 0) {
						await collectedInteraction.followUp({
							content:
								"Mahoraga was not summoned. You took too long to decide, And mahoraga went to sleep",
							ephemeral: true
						})
						resolve(false)
					}
				})
			})

			if (!confirmationResult) {
				return 0
			}

			await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })
			await new Promise(resolve => setTimeout(resolve, 4000))

			const outcome = Math.random()
			if (outcome < 0.5) {
				const userDamage = Math.floor(Math.random() * 50) + 10
				const newPlayerHealth = playerHealth - userDamage
				const clampedPlayerHealth = Math.max(0, newPlayerHealth)

				primaryEmbed.setImage("https://media1.tenor.com/m/xF0ATXhH9zoAAAAC/jujutsu-kaisen-megumi-fushiguro.gif")
				primaryEmbed.setDescription(`Mahoraga is untamed and attacks you! You take ${userDamage} damage.`)

				await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })
				await new Promise(resolve => setTimeout(resolve, 4000))

				primaryEmbed.setFields(
					{ name: "Player Health", value: `:blue_heart: ${playerHealth.toString()}`, inline: true },
					{ name: "Technique", value: fieldValue },
					{ name: "Shikigami", value: shikigamiName }
				)

				await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })
				await new Promise(resolve => setTimeout(resolve, 4000))

				await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })

				return { damage: clampedPlayerHealth, userTechniques: userTechniquesFight }
			} else {
				const enemyDamage = Math.floor(Math.random() * 100) + 50 // Random damage between 50 and 150
				const currentBossHealth = bossHealthMap.get(userId) || randomOpponent.max_health
				const newBossHealth = Math.max(0, currentBossHealth - enemyDamage)
				bossHealthMap.set(userId, newBossHealth)
				randomOpponent.current_health = newBossHealth

				primaryEmbed.setImage("https://media1.tenor.com/m/sFvgffc0uM8AAAAC/season-2-jujutsu-kaisen.gif")
				primaryEmbed.setDescription(
					`Mahoraga is untamed but attacks the enemy! The enemy takes ${enemyDamage} damage.`
				)

				await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })
				await new Promise(resolve => setTimeout(resolve, 4000))

				await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })

				return { damage: enemyDamage, userTechniques: userTechniquesFight }
			}
		}
	}
}

export async function executeDivineDogsTechnique({
	collectedInteraction,
	techniqueName,
	userTechniques: userTechniquesFight,
	userId,
	primaryEmbed,
	bossHealthMap,
	randomOpponent,
	row,
	activeShikigami
}) {
	const userShikigami = await getUserShikigami(userId)
	const hasDivineDogs = userShikigami.some(shikigami => shikigami.name === "Divine Dogs")

	if (!hasDivineDogs) {
		await collectedInteraction.followUp({
			content: "You haven't tamed the Divine Dogs yet. You fail in the summon.. The enemy gets a free hit!",
			ephemeral: true
		})
		return { damage: 0, userTechniquesFight: userTechniquesFight }
	}

	primaryEmbed.setImage("https://media1.tenor.com/m/LSBXOWQ1uugAAAAC/jujutsu-kaisen-megumi-fushiguro.gif")
	await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })

	const techniquesUsed = userTechniquesFight.get(userId) || []
	techniquesUsed.push(techniqueName)
	userTechniquesFight.set(userId, techniquesUsed)

	await new Promise(resolve => setTimeout(resolve, 3000))

	const enemyDamage = Math.floor(Math.random() * 50) + 10 // Random damage between 30 and 110
	const currentBossHealth = bossHealthMap.get(userId) || randomOpponent.max_health
	const newBossHealth = Math.max(0, currentBossHealth - enemyDamage)
	bossHealthMap.set(userId, newBossHealth)
	randomOpponent.current_health = newBossHealth

	await applyStatusEffect(userId, "Scarce")

	primaryEmbed.setDescription(
		`🐶 Divine Dogs are summoned and attack the enemy, dealing ${enemyDamage} damage! The enemy is now affected by Scarce.`
	)

	// Summon Divine Dogs
	const userShikigamiList = activeShikigami.get(userId) || []
	userShikigamiList.push("🐺 Divine Dogs")
	summonedShikigami.set(userId, "Divine Dogs")
	activeShikigami.set(userId, userShikigamiList)

	await updateShikigamiField(primaryEmbed, activeShikigami, userId)
	await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })

	return { damage: enemyDamage, userTechniquesFight: userTechniquesFight }
}

export async function executeNue({
	collectedInteraction,
	techniqueName,
	userTechniques: userTechniquesFight,
	userId,
	primaryEmbed,
	bossHealthMap,
	randomOpponent,
	row,
	activeShikigami
}) {
	const userShikigami = await getUserShikigami(userId)
	const hasDivineDogs = userShikigami.some(shikigami => shikigami.name === "Nue")

	if (!hasDivineDogs) {
		await collectedInteraction.followUp({
			content: "You haven't tamed Nue yet. You fail in the summon.. The enemy gets a free hit!",
			ephemeral: true
		})
		return { damage: 0, userTechniquesFight: userTechniquesFight }
	}
	primaryEmbed.setImage("https://media1.tenor.com/m/31xrp_9K33AAAAAd/megumi-fushiguro-jujutsu-kaisen.gif")
	await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })

	const techniquesUsed = userTechniquesFight.get(userId) || []
	techniquesUsed.push(techniqueName)
	userTechniquesFight.set(userId, techniquesUsed)

	await new Promise(resolve => setTimeout(resolve, 3000))

	const enemyDamage = Math.floor(Math.random() * 60) + 10 // Random damage between 30 and 110
	const currentBossHealth = bossHealthMap.get(userId) || randomOpponent.max_health
	const newBossHealth = Math.max(0, currentBossHealth - enemyDamage)
	bossHealthMap.set(userId, newBossHealth)
	randomOpponent.current_health = newBossHealth

	await applyStatusEffect(userId, "Infuse")

	primaryEmbed.setDescription(
		`🦉 Nue is summoned and attacks the enemy, dealing ${enemyDamage} damage! Nue has infused their power into you!`
	)

	const userShikigamiList = activeShikigami.get(userId) || []
	userShikigamiList.push("🦉 Nue")
	activeShikigami.set(userId, userShikigami)

	await updateShikigamiField(primaryEmbed, activeShikigami, userId)

	await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })

	return { damage: enemyDamage, userTechniquesFight: userTechniquesFight }
}

export async function executeToad({
	collectedInteraction,
	techniqueName,
	userTechniques: userTechniquesFight,
	userId,
	primaryEmbed,
	bossHealthMap,
	randomOpponent,
	row
}) {
	primaryEmbed.setImage("https://media1.tenor.com/m/31xrp_9K33AAAAAd/megumi-fushiguro-jujutsu-kaisen.gif")
	await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })

	const techniquesUsed = userTechniquesFight.get(userId) || []
	techniquesUsed.push(techniqueName)
	userTechniquesFight.set(userId, techniquesUsed)

	await new Promise(resolve => setTimeout(resolve, 3000))

	const enemyDamage = Math.floor(Math.random() * 10) + 1 // Random damage between 30 and 110
	const currentBossHealth = bossHealthMap.get(userId) || randomOpponent.max_health
	const newBossHealth = Math.max(0, currentBossHealth - enemyDamage)
	bossHealthMap.set(userId, newBossHealth)
	randomOpponent.current_health = newBossHealth

	primaryEmbed.setDescription(
		`🐸 Toad is summoned and attacks the enemy, dealing ${enemyDamage} damage! It's not very strong..`
	)

	primaryEmbed.addFields({ name: "Shikigami", value: "🐸 Toad" })

	await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })

	return { damage: enemyDamage, userTechniquesFight: userTechniquesFight }
}

export async function executeElephant({
	collectedInteraction,
	techniqueName,
	userTechniques: userTechniquesFight,
	userId,
	primaryEmbed,
	bossHealthMap,
	randomOpponent,
	row
}) {
	primaryEmbed.setImage("https://tenor.com/view/jujutsu-kaisen-megumi-fushiguro-fushiguro-kamo-gif-20359301")
	await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })

	const techniquesUsed = userTechniquesFight.get(userId) || []
	techniquesUsed.push(techniqueName)
	userTechniquesFight.set(userId, techniquesUsed)

	await new Promise(resolve => setTimeout(resolve, 3000))

	const enemyDamage = Math.floor(Math.random() * 10) + 1 // Random damage between 30 and 110
	const currentBossHealth = bossHealthMap.get(userId) || randomOpponent.max_health
	const newBossHealth = Math.max(0, currentBossHealth - enemyDamage)
	bossHealthMap.set(userId, newBossHealth)
	randomOpponent.current_health = newBossHealth

	primaryEmbed.setDescription(
		`🐸 Toad is summoned and attacks the enemy, dealing ${enemyDamage} damage! It's not very strong..`
	)

	primaryEmbed.addFields({ name: "Shikigami", value: "🐸 Toad" })

	await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })

	return { damage: enemyDamage, userTechniquesFight: userTechniquesFight }
}

export async function handleMahoragaAttack(
	collectedInteraction,
	bossHealthMap,
	randomOpponent,
	primaryEmbed,
	row,
	userTechniquesFight
) {
	const hasMahoragaAdaptation = userTechniquesFight.has(`${collectedInteraction.user.id}_mahoraga_adaptation`)
	if (!hasMahoragaAdaptation) {
		return
	}

	const currentBossHealth = bossHealthMap.get(collectedInteraction.user.id) || 0

	if (currentBossHealth <= 0) {
		return
	}

	logger.info("Mahoraga attack")

	const userShikigami = await getUserShikigami(collectedInteraction.user.id)
	const hasDivineGeneralMahoraga = userShikigami.some(shikigami => shikigami.name === "Divine-General Mahoraga")

	let mahoragaAdaptation = userTechniquesFight.get(`${collectedInteraction.user.id}_mahoraga_adaptation`) || 0

	if (mahoragaAdaptation > 0) {
		mahoragaAdaptation++
		userTechniquesFight.set(`${collectedInteraction.user.id}_mahoraga_adaptation`, mahoragaAdaptation)

		let mahoragaDamage = Math.floor(Math.random() * 20) + 75
		if (hasDivineGeneralMahoraga) {
			mahoragaDamage += 50
		}

		const currentBossHealth = bossHealthMap.get(collectedInteraction.user.id) || 0
		const newBossHealth = Math.max(0, currentBossHealth - mahoragaDamage)
		bossHealthMap.set(collectedInteraction.user.id, newBossHealth)
		randomOpponent.current_health = newBossHealth

		primaryEmbed.addFields([
			{ name: "Mahoraga Adaptation", value: `${mahoragaAdaptation}/6`, inline: true },
			{
				name: "Mahoraga Attack",
				value: `Mahoraga deals ${mahoragaDamage} damage to the enemy!`,
				inline: false
			}
		])

		if (hasDivineGeneralMahoraga) {
			primaryEmbed.setColor("Gold")
			primaryEmbed.setTitle("✨ Divine-General Mahoraga's Attack ✨")
			primaryEmbed.setDescription("The Divine-General Mahoraga unleashes its sacred power!")
		}

		await collectedInteraction.editReply({ embeds: [primaryEmbed] })

		if (mahoragaAdaptation === 6) {
			const mahoragaSpecialDamage = Math.floor(Math.random() * 200) + 100
			const additionalDamage = hasDivineGeneralMahoraga ? 100 : 0
			const totalSpecialDamage = mahoragaSpecialDamage + additionalDamage

			const currentBossHealth = bossHealthMap.get(collectedInteraction.user.id) || 0
			const newBossHealth = Math.max(0, currentBossHealth - totalSpecialDamage)
			bossHealthMap.set(collectedInteraction.user.id, newBossHealth)
			randomOpponent.current_health = newBossHealth

			primaryEmbed.setDescription("Mahoraga has fully adapted... and is now using a special attack!")
			primaryEmbed.setImage("https://media1.tenor.com/m/h9vZeOgN-5gAAAAC/mahoraga-adapts-mahoraga.gif")

			await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })
			await new Promise(resolve => setTimeout(resolve, 5000))

			primaryEmbed.setDescription(
				`Mahoraga has unleashed its full power, dealing ${totalSpecialDamage} damage to the enemy!`
			)
			primaryEmbed.setImage("https://media1.tenor.com/m/pYgj13yEW_wAAAAC/sukuna-mahoraga.gif")
			userTechniquesFight.delete(`${collectedInteraction.user.id}_mahoraga_adaptation`)

			await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [] })
			await new Promise(resolve => setTimeout(resolve, 3000))

			await collectedInteraction.editReply({ embeds: [primaryEmbed], components: [row] })
		}
	}
}

export async function handleDivineDogsDamage(interaction, randomOpponent, playerHealth, statusEffects) {
	const userSummonedShikigami = summonedShikigami.get(interaction.user.id)

	if (userSummonedShikigami === "Divine Dogs") {
		const userShikigami = await getUserShikigami(interaction.user.id)
		const divineDogs = userShikigami.find(shikigami => shikigami.name === "Divine Dogs")

		if (divineDogs && divineDogs.health > 10) {
			const friendshipLevel = divineDogs.friendship
			const chanceToTakeHit = Math.min(0.3 + (friendshipLevel / 100) * 0.4, 0.7)

			if (Math.random() < chanceToTakeHit) {
				const possibleAttacks = attacks[randomOpponent.name]
				const chosenAttack = possibleAttacks[Math.floor(Math.random() * possibleAttacks.length)]
				const damageToDogsBeforeReduction = chosenAttack.baseDamage
				const damageToDogsAfterReduction = await calculateDamageWithEffects(
					interaction.user.id,
					damageToDogsBeforeReduction,
					statusEffects
				)
				const newDogsHealth = Math.max(10, divineDogs.health - damageToDogsAfterReduction)

				if (newDogsHealth === 10) {
					summonedShikigami.delete(interaction.user.id)
					await interaction.followUp({
						content: "The Divine Dogs have been unsummoned due to low health.",
						ephemeral: true
					})
				} else {
					await updateShikigamiHealth(interaction.user.id, "Divine Dogs", newDogsHealth)
					divineDogs.health = newDogsHealth
				}

				return { divineDogsHit: true, newPlayerHealth: playerHealth }
			}
		}
	}

	return { divineDogsHit: false, newPlayerHealth: playerHealth }
}

const quotes = [
	"Greetings from the author! I'm Akutami, the creator of Jujutsu Kaisen. I'm very happy to meet you all!",
	"Greetings from the developer!",
	"Nice to meet you. Long time no see to the people who followed me in GIGA magazine. I'll do my very best!",
	"It was through my editor, but a senpai creator complimented my first chapter. It really got me going!",
	"I told someone the meal they treated me to was 'as tasty as snacks' and was told that was not an appropriate comparison.",
	"I hope that Tomita-san and Wakabayashi-san's rap and Miyata-san and Kasuga-san's food diary can both happen.",
	"There's a clear reason why I started to draw slender girls. (People still say they're fat.)",
	"My mother's only thoughts on my manga was 'not bad.' From this reaction, I realized many things.",
	"I received a supportive comment from my dear mentor, Kano-sensei. Congratulations on completing your work, Kano-sensei!",
	"Vegeta hammer and superhero landing! I'm very satisfied after drawing so many Kamen Rider memes!",
	"In chapter 1, I accidentally wrote the 禪 'zen' in 'Zen'in' as 禅 instead. Sorry, I'll be more careful in the future.",
	"I realized that performing on the street naturally takes a lot of courage, but so does stopping to listen.",
	"I've got a face that makes people want to ask me for directions, so I frequently take people I don't know to places I don't know.",
	"I received some refreshments from a reader. I will use it gratefully!",
	"It's the cover!! Thanks to everyone for all this time! All of you here! And the ones upstairs!",
	"I think it would be interesting to change the 'money' in Nanami's words to whoever your idol is!",
	"I am the second-generation Akutami! My favorite word is 'thanks!' The first generation is dead!",
	"I've really loved sensei's touching manga since Room 303. It's lonely here!",
	"In chapter 37, the furigana 'harawata' for 'stomach' was written incorrectly. But enough about that, please look at the book obi for volume 3!",
	"If I die, please fill my coffin with volume 3's book obi. I'm begging you, please.",
	"I bought a black mountain parka (like Gojo's) that's supposed to last for six years. I put it in storage after one week.",
	"My brain was on vacation, so I assumed the era name was changing on January 1.",
	"I was talking about manners with my editor, and I started picking my nose. Who would trust me on this issue?",
	"I need to do something about the three-section staff looking like fluorescent light tubes.",
	"You may have realized this, but Itadori has been brainwashed by Todo.",
	"My favorite Skylab Hurricane techniques are the low-flying ones and the ones featuring Jito-kun.",
	"After meeting my deadline, I went to the park to refresh myself. I tried to blast my ki at the pigeons, but none of them flew away.",
	"Akutami: 'To the second power' sounds more powerful than 'multiplied by two'!\nA: But one to the second power is still one.\nAkutami: Oh...",
	"Last week I totally forgot to draw the Yu-Un* weapon in the last four pages. I think I've also made a lot of kanji mistakes recently.",
	"My editor apologized that we had switched Hanami's left and right arms, but that mistake was probably definitely mine.",
	"Gojo ends up saying 'play ball' twice, but don't worry about it.",
	"Even that simple baseball chapter was really hard. I'm amazed by manga artists who create sports manga!",
	"Here we go! The final front-of-the-magazine color pages of the Heisei era! History in the making! See it live!",
	"Volume 5 is a curse with the might of My Hero Academia! Thank you so much, Horikoshi Sensei!",
	"My dry skin that wouldn't get better with pharmacy medicine was healed in two days after I went to a dermatologist.",
	"It's possible that I may have contracted the 'I'll die if I don't draw a half-naked macho character' disease.",
	"I realized that I don't want to own a large dog—what I want is to live with a Pokémon.",
	"I've been saying that Tsumiki's hair is like a kuwagata beetle.",
	"Michopa-san is starting up a radio show called #Michopara on Nippon Broadcasting System.",
	"Last week I drew some of Eso's shoulder that had already been blown off… Don't worry about it!",
	"I'm sure you've all realized, but for the Givenchy stuff I'm just pretending to know about it.",
	"I spent all day thinking about things that were popular in the nineties and then realized I was off by a decade.",
	"Drawing this chapter gave me a craving for sausages. Schau Essen is my favorite.",
	"Does Jujutsu Kaisen have too many phone scenes?",
	"They're on their phones again in that Jujutsu Kaisen manga…",
	"I keep thinking how I really should have made the manga take place in a time before mobile phones.",
	"Hinomaru lifted me up so many times over the years. Congratulations on an amazing conclusion!",
	"It's two days later, so this should be about right! But the place where I wrote the time frame for the bounty was way off.",
	"Because of this flashback arc and the summer heat, I forgot how to draw Itadori. I suddenly had to work really hard.",
	"I'm not consciously trying to be self-deprecating, but I sometimes make people feel awkward by being overly critical of myself.",
	"I'm so sorry for changing the meaning of 'Reverse Cursed Technique' and 'Cursed Technique Reversal.'",
	"Tenjo tenge yuiga dokuson ('Throughout heaven and earth, I alone am the honored one') seems to have various connotations, but I like using it in the arrogant sense of the phrase.",
	"Gojou's jutsushiki* is still 'almost always on' in the present, so there are times when it's off. Try to find those.",
	"It seems like I was the only one who really got into the title page. Geto was like the straight man: 'Enough already!' (Exits stage)",
	"Apparently it seems unlikely that there were separated smoking areas in Shinjuku in 2007, at least according to my assistant's research.",
	"I've been wanting to make LINE stamps. I had so much fun. Enjoy!",
	"Let's go! A new hobby! I didn't take it so seriously, but I felt like I was dying because I'm not used to it.",
	"Last week I forgot to include a Miwa puppet in the ways to contact Gojo. That's all right!",
	"You all knew that Mode: Absolute would just turn into a big macho guy, right?",
	"I'm throwing myself at so many jobs that it feels like Sadako vs. Kayako.",
	"I'm desperate enough that I'm thinking about just moving to a new studio.",
	"Something Satoru Gojo doesn't have… Probably a personality.",
	"Hopefully nobody notices that Jogo didn't actually say 'don't run away' in chapter 84…",
	"I just called them grasshoppers, but I used the desert locust as reference.",
	"I tried a scapular-retraction exercise, and not only could I not move, I hurt my back.",
	"The recent Jujutsu Kaisen chapters have been all about 'how many times did you say Satoru Gojo?'",
	"I seriously messed up the composition of the background and background characters two chapters ago. My bad.",
	"Now that Gojo is gone, it's looking like 2020's gonna be a good year.",
	"The Fire Street name was funnier than the manga, so I cut it.",
	"The more characters there are, the more I forget how to draw them every week. I'll try to be careful…",
	"I was checking out the way wires move using the cord of my earphones, but then it broke.",
	"If your deadline is coming up, the weight of your crime is less if you say 'I passed out' instead of 'I fell asleep.'",
	"The latest chapter on Akutami: I made a mistake between C and S and now everyone knows I'm an idiot that surpasses the bounds of human understanding.",
	"The characters are taking heavy damage in the same order that they're easiest to draw. That makes me worried about future chapters.",
	"Awasaka's cursed technique has a higher upper limit against attacks without cursed energy. The elephant doesn't use much cursed energy if there is no water.",
	"The stuff on the bonus pages of volume 10 about jujutsu sorcerers being distant is kind of hilarious when you think about what Gojo says.",
	"Sorry that the characters are just punching each other. I'll have them do jujutsu stuff soon.",
	"Down to the last roll of toilet paper in the studio, a shiver ran down my spine. But it was okay.",
	"I'm usually not a fan of name brands, but I was doing research in Shibuya and absentmindedly went into a Balenciaga store…",
	"I'm wishing the best for news anchor Hitomi Ichinose in both her work and personal life!",
	"People are asking me if I bought it, but I'm a loser so I ran out of the store.",
	"You can use Pocket Marche to buy cheap food ingredients that have nowhere to go because of the coronavirus.",
	"Congratulations on concluding the series! I believe that Kimetsu has created many new manga fans. It's amazing!",
	"I said Kanegon* when I meant to say Booska**! And people actually saw me do it! Anyway, I'll still work really hard in year three of this series!",
	"When it comes to ramen, there's just no way my cooking can compete. I really wanna go out and eat some.",
	"I want to support Royal Host restaurant, but unfortunately I don't have one in my neighborhood.",
	"Miura Sensei, Shirai Sensei, Demizu Sensei, congratulations! I can't go on any further!",
	"Everyone's working from home, so I'm always debating whether I should clean my assistants' desks at the studio or not.",
	"Because the domain at the prison didn't have a jujutsu technique attached to it, it's not like the octopus battle.",
	"The lack of seals on the finger case! How Jogo knew the number of fingers Mimi-Nana had given Itadori… So many errors!",
	"I drew some art for the new Memumemu-chan volume. I regret not drawing a girl!",
	"Congratulations, Furudate Sensei! Shiratorizawa Ba-bam bam bam!",
	"I paid my taxes! Thank you so much to my accountant. Even though I didn't want to pay…",
	"I'm all lethargic, and I have many more white hairs. A side effect of paying my taxes?",
	"Suddenly a weird smell from the kitchen! I totally forgot about the fish I grilled two days ago.",
	"I'm going in for my first hair coloring, and I think I'm going to try white. Does anyone have any other color recommendations?",
	"Because I'm slightly color-blind and the color chart makes no sense to me, I'm on the verge of giving up on coloring my hair.",
	"'Inanimate objects' was supposed to be 'Anything without cursed energy' in Sukuna's Domain Expansion! Oops! Oh well…",
	"These toilet paper rolls with five times the paper are a lifesaver!",
	"I've been meaning to say that with the times being what they are, the original lead-page arena idea was canceled, but I forgot again last week.",
	"Hiramatsu-san designed a young Kugisaki for the anime. Amazing!",
	"I've been enjoying hayashi rice lately. Sorry for thinking you were fake curry rice all these years.",
	"The Jujutsu anime! Everything is going smoothly, and I'm so impressed with the team. I can't thank them enough!",
	"Don't tell anyone that I never finished the Super Famicon version of Tokimeki Memorial.",
	"Code Geass came up in conversation for the first time in a while, so I did a Rakshata impression, but everyone ignored me.",
	"Doing research is so fun! I'm embarrassed about how when I was a student, all I did was think of reasons not to study.",
	"I've posted corrections*** to some of the mistakes in the last chapter on the series' official Japanese Twitter account. I'll be more careful!",
	"I did the thing where you buy protein once a year and it feels like you lose weight.",
	"Renovating my studio will increase my efficiency. Believe me… Don't hit me…",
	"I was tweaking the snowfield till the very end. I'd like next week to be the last side story for a while.",
	"Every single panel was seriously amazing! Congratulations, Fujimoto Sensei!",
	"The Kuala Lumpur night vista looks like Penang Hill, but please don't think too much about it.",
	"My favorite Arlong aside from the one in the manga is the Arlong from Grand Battle 2.",
	"I broke my perfect schedule for the holidays before the year was over. Heh heh.",
	"My excuse is that I need the events during the holidays to reset myself.",
	"If you are curious about Okkotsu, please read volume 0. He's indecisive.",
	"I'm sorry for last week. Even after I had a short bonus chapter at the end of last year too.",
	"I was worried I would become like Pesci if I took a week off, but I properly had the cold sweats.",
	"For some reason, there's a box of cigarettes at the studio, so I'm using it for smoker jokes.",
	"I've been told that Ramurin is no longer a regular character on Shimajiro.",
	"It's been a while since I tried to do something I'm not capable of—and felt like when Yujiro Hanma let Alai Jr. leave.",
	"Naoya's accent is supposed to be from Kyoto, but the people helping me with it are from Nara and Wakayama.",
	"I overheard something about Eva I didn't know, so I tried to join in, but it was about Super Robot Wars.",
	"No, I wasn't just too lazy to have the background for the Tombs of the Star Corridor drawn! Stop looking at me like that!",
	"Maybe nobody noticed, but in the previous chapter I drew Maki's right eye normally.",
	"If I'm not careful, my new pen slips. So I need to pay greater attention or switch back to my old pen.",
	"I made the mistake of getting sick during my break. I'll try to shape up.",
	"I was studying history when I realized that all these people are dead. Talk about spoilers!",
	"To my past self: The Tosa domain wasn't in Kyushu, it was in Kochi. Choshu wasn't in Kyushu, it was in Yamaguchi.",
	"I won't submit rough drafts for the final version again, so important people of the country, please don't say studying is worthless.",
	"I'll be taking a short break. There will be additional information online, so please check that out too.",
	"Thank you so much to the mangaka and readers who reached out to me while I was on hiatus.",
	"Thanks to the Shibuya Incident chapters, my ability to come up with chapter titles has diminished.",
	"They have small- and regular-sized masks, but I don't see anyone selling the large size. Is my face just huge?!",
	"In the GN extras, Gakuganji is getting a vaccine, but I haven't been able to get mine yet. I'm scared.",
	"My assistant started talking about The Fast and the Furious right before driving me around. Not good for my heart!",
	"I'm from the Sam Raimi generation, so I went 'Whoa!' when Doctor Octopus showed up.",
	"This week I accidentally had the exact same panel layout for the right and left pages in a spread, but it's probably not the first time.",
	"Two chapters ago when Kogane showed info on the players, it said that Itadori was already in Tokyo No. 2 Colony. That was an error.",
	"I like the seedless grapes with the skin you don't eat. The ones from Yamanashi seem really good.",
	"Haba is done, and I never really got down his way of speaking. I don't have anyone around me from Hiroshima.",
	"I want to play Pokémon Red/Green/Gold/Silver, but can you use glitches on the Virtual Console version?",
	"The second shot really got me. Sorry for making everyone wait a week.",
	"I quickly switched to digital production while being serialized in Jump GIGA, so I understand what Hasegawa sensei is feeling.",
	"What's with this potato?! It's delish!!! Is it because it's cut differently? (It was a lily bulb.)",
	"I'm still wearing sandals. I think I can go a little longer. I don't want to wear socks."
]

export function getRandomQuote() {
	const randomIndex = Math.floor(Math.random() * quotes.length)
	return quotes[randomIndex]
}

export function createShikigamiEmbed(selectedShikigami) {
	let description = null

	const isHealthGood = selectedShikigami.health > 80
	const isHungerGood = selectedShikigami.hunger > 80
	const isHygieneGood = selectedShikigami.hygiene > 80

	if (isHealthGood && isHungerGood && isHygieneGood) {
		description = "Your shikigami is in great condition!"
	}

	// Check health level
	if (selectedShikigami.health <= 20) {
		description = "Your shikigami's health is critically low!"
	} else if (selectedShikigami.health <= 50) {
		description = "Your shikigami's health is low."
	}

	// Check hunger level
	if (selectedShikigami.hunger <= 20) {
		description = "Your shikigami is starving!"
	} else if (selectedShikigami.hunger <= 50) {
		description = "Your shikigami is hungry."
	}

	// Check hygiene level
	if (selectedShikigami.hygiene <= 20) {
		description = description ? `${description} It also needs a bath!` : "Your shikigami needs a bath!"
	} else if (selectedShikigami.hygiene <= 50) {
		description = description ? `${description} It's also not very clean.` : "Your shikigami is not very clean."
	}

	const embed = new EmbedBuilder()
		.setTitle(`${selectedShikigami.name} ${getShikigamiEmoji(selectedShikigami.name)}`)
		.setColor("#7289da")
		.setDescription(description)
		.setFooter({ text: getRandomQuote() })
		.addFields(
			{
				name: "Tamed At",
				value: `<t:${Math.floor(selectedShikigami.tamedAt.getTime() / 1000)}:f>`,
				inline: true
			},
			{
				name: "Hunger",
				value: `${createBar(Math.max(0, Math.min(100, selectedShikigami.hunger)), 100)} **${
					selectedShikigami.hunger
				}%**`,
				inline: true
			},
			{
				name: "Hygiene",
				value: `${createBar(Math.max(0, Math.min(100, selectedShikigami.hygiene)), 100)} **${
					selectedShikigami.hygiene
				}%**`,
				inline: true
			},
			{
				name: "Friendship",
				value: `${createBar(Math.max(0, Math.min(100, selectedShikigami.friendship)), 100)} **${
					selectedShikigami.friendship
				}**`,
				inline: true
			},
			{
				name: "Experience",
				value: `**${selectedShikigami.experience}**`,
				inline: true
			},
			{
				name: "Level",
				value: selectedShikigami.tier.toString(),
				inline: true
			}
		)
	if (shikigamiThumbnails[selectedShikigami.name]) {
		embed.setThumbnail(shikigamiThumbnails[selectedShikigami.name])
	}

	if (selectedShikigami.health !== undefined) {
		embed.addFields({
			name: "Health",
			value: `${createBar(Math.max(0, Math.min(100, selectedShikigami.health)), 100)} **${
				selectedShikigami.health
			}%**`,
			inline: true
		})
	}

	if (selectedShikigami.name === "Divine-General Mahoraga") {
		embed.setThumbnail("https://i.redd.it/e99r17yyf31c1.jpg")
		embed.setColor("Gold")
		const shinyBadge = "✨"
		embed.setTitle(`${shinyBadge} ${selectedShikigami.name} ${getShikigamiEmoji(selectedShikigami.name)}`)

		const divineMahoragaQuotes = [
			"Divine-General Mahoraga wonders if you're worthy of its divine presence.",
			"Divine-General Mahoraga silently judges your every move. No pressure!",
			"Divine-General Mahoraga reminds you that with great power comes great responsibility... and occasional attitude.",
			"Divine-General Mahoraga is not impressed by your mortal antics. Step up your game!",
			"Divine-General Mahoraga demands tribute in the form of premium shikigami treats. Or else..."
		]
		const randomDivineMahoragaQuote = divineMahoragaQuotes[Math.floor(Math.random() * divineMahoragaQuotes.length)]
		embed.addFields({
			name: "Divine-General Mahoraga's Divine Wisdom",
			value: randomDivineMahoragaQuote,
			inline: false
		})

		if (selectedShikigami.friendship <= 50) {
			embed.addFields({
				name: "Divine-General Mahoraga's Thoughts",
				value: "Divine-General Mahoraga grows tired of your presence. Perhaps it's time to step up your game?",
				inline: false
			})
		} else {
			embed.addFields({
				name: "Divine-General Mahoraga's Thoughts",
				value: "Divine-General Mahoraga acknowledges your efforts. Keep up the good work, mortal!",
				inline: false
			})
		}

		embed.addFields({
			name: "Special Abilities",
			value: "- Enhanced Divine Power\n- Increased Damage Output",
			inline: false
		})
	}

	if (selectedShikigami.name === "Mahoraga") {
		const mahoragaQuotes = [
			"Mahoraga gives you a stern look, as if questioning your life choices.",
			"Mahoraga lets out a yawn, clearly unimpressed by your presence.",
			"Mahoraga wonders if you have any tasty cursed spirits to snack on.",
			"Mahoraga contemplates the meaning of life... and whether you're feeding it enough.",
			"Mahoraga plots world domination... starting with taking over your snack stash."
		]
		const randomMahoragaQuote = mahoragaQuotes[Math.floor(Math.random() * mahoragaQuotes.length)]
		description += `\n${randomMahoragaQuote}`

		// Add friendship-based witty lines for regular Mahoraga
		if (selectedShikigami.friendship <= 50) {
			embed.addFields({
				name: "Mahoraga's Thoughts",
				value: "Mahoraga wonders if it chose the wrong master. Maybe it's time to reconsider your bond.",
				inline: false
			})
		} else {
			embed.addFields({
				name: "Mahoraga's Thoughts",
				value: "Mahoraga seems to have warmed up to you. Keep nurturing your friendship!",
				inline: false
			})
		}
	}

	if (selectedShikigami.name === "Garuda") {
		embed.setColor("DarkVividPink")
		const shinyBadge = "✨"
		embed.setTitle(`${shinyBadge} ${selectedShikigami.name} ${getShikigamiEmoji(selectedShikigami.name)}`)
		embed.addFields({
			name: "Special Abilities",
			value: "- Friendly and Loyal\n- Increased Speed and Agility",
			inline: false
		})
	}

	return embed
}

export async function startPlayingMinigame(interaction, shikigami) {
	const questions = [
		{ question: "What is the capital of France?", answer: "Paris" },
		{ question: "What is the largest planet in our solar system?", answer: "Jupiter" },
		{ question: "What is the currency of Japan?", answer: "Yen" },
		{ question: "What color is the sky?", answer: "Blue" },
		{ question: "How many legs does a cat have?", answer: "4" },
		{ question: "What is the opposite of hot?", answer: "Cold" },
		{ question: "What is the color of an apple?", answer: "Red" },
		{ question: "What animal says 'meow'?", answer: "Cat" },
		{ question: "What is the capital of the United States?", answer: "Washington, D.C." },
		{ question: "What is the largest continent in the world?", answer: "Asia" },
		{ question: "What is the chemical symbol for gold?", answer: "Au" },
		{ question: "What is the boiling point of water in degrees Celsius?", answer: "100" },
		{ question: "What is the square root of 49?", answer: "7" },
		{ question: "What is the capital of Australia?", answer: "Canberra" },
		{ question: "What is the smallest country in the world?", answer: "Vatican City" }
	]

	const selectedQuestions = getRandomQuestions(questions, 3)

	const playingEmbed = new EmbedBuilder()
		.setTitle("Shikigami Quiz Minigame")
		.setDescription(`Play with ${shikigami.name}!`)
		.addFields(
			selectedQuestions.map((question, index) => ({
				name: `Question ${index + 1}`,
				value: question.question
			}))
		)
		.addFields({
			name: "Instructions",
			value: "Type your answers within 30 seconds, separated by commas (,)!\nFor example: Paris, Jupiter, Yen"
		})

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const playingMessage = await interaction.editReply({ embeds: [playingEmbed] })

	const filter = message => {
		return message.author.id === interaction.user.id
	}

	try {
		const collectedMessage = await interaction.channel.awaitMessages({
			filter,
			max: 1,
			time: 30000,
			errors: ["time"]
		})

		const userAnswers = collectedMessage.first().content.trim().toLowerCase().split(",")

		let correctAnswers = 0
		const questionResults = selectedQuestions.map((question, index) => {
			const isCorrect = userAnswers[index] && userAnswers[index].trim() === question.answer.toLowerCase()
			if (isCorrect) {
				correctAnswers++
			}
			return {
				name: `Question ${index + 1}`,
				value: `${question.question}\nYour Answer: ${userAnswers[index] || "No Answer"}\nCorrect Answer: ${
					question.answer
				}`,
				inline: false
			}
		})

		if (correctAnswers === selectedQuestions.length) {
			await interaction.followUp(
				`Congratulations! You answered all ${selectedQuestions.length} questions correctly!`
			)
			await increaseBond(interaction.user.id, shikigami.name, 30)
		} else {
			const resultEmbed = new EmbedBuilder()
				.setTitle("Quiz Results")
				.setDescription(
					`You answered ${correctAnswers} out of ${selectedQuestions.length} questions correctly.`
				)
				.addFields(questionResults)

			await interaction.editReply({ embeds: [resultEmbed] })
		}
	} catch (error) {
		await interaction.followUp({
			content: "Oops! You didn't provide answers within the time limit. Better luck next time!",
			ephemeral: true
		})
	}
}

function getRandomQuestions(questions, count) {
	const shuffled = questions.sort(() => 0.5 - Math.random())
	return shuffled.slice(0, count)
}

export function getRandomItemDescription(itemName: string): string {
	const descriptions = {
		"Special-Grade Medicine": [
			"Your Shikigami will feel invigorated after consuming this.",
			"This potent potion will restore your Shikigami's vitality.",
			"Your Shikigami's wounds will mend with this powerful elixir."
		],
		"Shikigami Food": [
			"Your Shikigami will love this delicious and energizing treat!",
			"This tasty snack will give your Shikigami a burst of energy.",
			"Packed with nutrients, this bar will keep your Shikigami's stamina high."
		]
	}

	const itemDescriptions = descriptions[itemName] || []
	const randomIndex = Math.floor(Math.random() * itemDescriptions.length)
	return itemDescriptions[randomIndex] || ""
}

export function getShikigamiEmoji(shikigamiName) {
	const shikigamiEmojis = {
		"Divine Dogs": "<a:beatrizconradohappyjoy:1231815833689395213>",
		"Toad": "🐸",
		"Max Elephant": "🐘",
		"Divine-General Mahoraga": "<:mahoragapixe:1231814681350635530>",
		"Mahoraga": "😈",
		"Great Serpent": "🐍",
		"Nue": "🦚",
		"Noj": "<:73062buwumask:1230903140703015035>",
		"Kitsune": "<:6861shirohappynoises:1230889537761316924>",
		"Mythical Dragon": "<:2087dragon:1230896152950476880>",
		"Mystical Fox": "<:6702foxed:1230903814517686293>",
		"Garuda": "🦅",
		"Black Cat": "<a:4349sleepycat:1231732752362242168>"
	}

	return shikigamiEmojis[shikigamiName] || "❓"
}

export const shinyShikigamis = ["Divine-General Mahoraga", "Garuda"]

export const shikigamiEmojis = {
	"Divine Dogs": "<a:beatrizconradohappyjoy:1231815833689395213>",
	"Toad": "🐸",
	"Max Elephant": "🐘",
	"Divine-General Mahoraga": "<:mahoragapixe:1231814681350635530>",
	"Mahoraga": "😈",
	"Great Serpent": "🐍",
	"Nue": "🦚",
	"Noj": "<:73062buwumask:1230903140703015035>",
	"Kitsune": "<:6861shirohappynoises:1230889537761316924>",
	"Mythical Dragon": "<:2087dragon:1230896152950476880>",
	"Mystical Fox": "<:6702foxed:1230903814517686293>",
	"Garuda": "🦅",
	"Black Cat": "<a:4349sleepycat:1231732752362242168>"
}

export const shikigamiItems2 = [
	{ name: "Special-Grade Medicine", rarity: "Special", price: 85000 },
	{ name: "Shikigami food", rarity: "Special", price: 50000 }
]
