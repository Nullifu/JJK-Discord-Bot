import { Storage } from "@google-cloud/storage"
import { ImageAnnotatorClient } from "@google-cloud/vision"
import AWS from "aws-sdk"
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js"
import { config as dotenv } from "dotenv"
import logger from "./bot.js"

dotenv()

interface AnalysisResult {
	isSafe: boolean
}

AWS.config.update({
	region: "eu-west-2",
	credentials: new AWS.Credentials({
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
	})
})

const visionclient = new ImageAnnotatorClient({
	keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
	projectId: process.env.GOOGLE_PROJECT_ID
})

const rekognition = new AWS.Rekognition()

export async function checkImageForNSFW(imageUrl) {
	try {
		const response = await fetch(imageUrl)
		if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`)

		// Handle GIFs immediately
		if (imageUrl.endsWith(".gif") || response.headers.get("content-type") === "image/gif") {
			logger.info("GIF detected - Sending for manual review")
			return { isSafe: false, requiresManualReview: true }
		}

		const imageBuffer = await response.arrayBuffer()
		const awsResult = await analyzeWithRekognition(Buffer.from(imageBuffer))
		const googleResult = await analyzeWithGoogleVision(imageUrl)

		const isSafe = awsResult.isSafe && googleResult.isSafe

		return { isSafe: isSafe, requiresManualReview: false }
	} catch (error) {
		logger.error("Error processing image:", error)
		return { isSafe: false, requiresManualReview: false }
	}
}

async function analyzeWithRekognition(imageBuffer: Buffer): Promise<AnalysisResult> {
	logger.info("Analyzing image with AWS Rekognition")
	const params = {
		Image: {
			Bytes: imageBuffer
		},
		MinConfidence: 80
	}

	return new Promise((resolve, reject) => {
		rekognition.detectModerationLabels(params, (err, data) => {
			logger.info("AWS Rekognition result:", data)
			if (err) {
				logger.error(err)
				reject(err)
			} else {
				const isSafe = !data.ModerationLabels.find(
					label =>
						label.Name === "Explicit Nudity" ||
						label.Name === "Suggestive" ||
						label.Name === "Violence" ||
						label.Name === "Visually Disturbing" ||
						label.Name === "Graphic Content" ||
						label.Name === "Partial Nudity" ||
						label.Name === "Sexual Activity" ||
						label.Name === "Sexually Suggestive" ||
						label.Name === "Nudity"
				)
				resolve({ isSafe })
			}
		})
	})
}

async function analyzeWithGoogleVision(imageUrl: string): Promise<AnalysisResult> {
	logger.info("Analyzing image with Google Vision")

	const [result] = await visionclient.safeSearchDetection(imageUrl)

	logger.info("Google Vision result:", result.safeSearchAnnotation)

	const detections = result.safeSearchAnnotation
	const isSafe =
		detections.adult !== "LIKELY" &&
		detections.adult !== "POSSIBLE" &&
		detections.adult !== "VERY_LIKELY" &&
		//
		detections.racy !== "LIKELY" &&
		detections.racy !== "VERY_LIKELY" &&
		//
		detections.violence !== "VERY_LIKELY" &&
		detections.violence !== "POSSIBLE" &&
		detections.violence !== "LIKELY" &&
		//
		detections.medical !== "VERY_LIKELY" &&
		detections.medical !== "POSSIBLE" &&
		detections.medical !== "LIKELY" &&
		//
		detections.spoof !== "VERY_LIKELY" &&
		detections.spoof !== "POSSIBLE" &&
		detections.spoof !== "LIKELY"

	logger.info("Google Vision result:", isSafe)
	return { isSafe }
}

export function createModerationModal(customId, title, label) {
	const modal = new ModalBuilder().setCustomId(customId).setTitle(title)

	const reasonInput = new TextInputBuilder()
		.setCustomId("reason_input")
		.setLabel(label)
		.setStyle(TextInputStyle.Paragraph)
		.setRequired(true)
		.setPlaceholder("Enter the reason here...")

	const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput)

	modal.addComponents(firstActionRow)
	return modal
}

const storage = new Storage()
const bucketName = "jjk_bot"

export async function uploadImageToGoogleStorage(imageBuffer, filename, contentType) {
	const bucket = storage.bucket(bucketName)
	const file = bucket.file(filename)

	try {
		await file.save(imageBuffer, {
			metadata: {
				contentType: contentType
			}
		})

		const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`
		return publicUrl
	} catch (err) {
		logger.error("Error uploading image to Google Storage:", err)
		throw err
	}
}
