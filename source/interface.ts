export interface UserSlapCount {
	userId: string
	count: number
}

export interface BossData {
	id: number
	bossName: string
	name: string
	max_health: number
	current_health: number
	image_url: string
	difficulty_tier: number
}
