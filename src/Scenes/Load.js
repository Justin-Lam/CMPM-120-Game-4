class Load extends Phaser.Scene
{
	constructor()
	{
		super('loadScene')
	}

	preload()
	{
		// Set load path
		this.load.path = './assets/';

		this.load.image("Player", "Player_temp.png");
		this.load.image("Net Swipe", "Net Swipe_temp.png");
		this.load.image("Bread", "Bread_temp.png");
		this.load.image("Enemy1", "Enemy1_temp.png");
		this.load.image("Enemy2", "Enemy2_temp.png");
		this.load.image("Enemy Poop", "Enemy Poop_temp.png");
	}

	create()
	{
		// Start the first scene
		this.scene.start("testScene")
	}
}