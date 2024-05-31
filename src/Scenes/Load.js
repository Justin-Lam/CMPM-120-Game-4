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
		this.load.image("Enemy", "Enemy_temp.png");
	}

	create()
	{
		// Start the first scene
		this.scene.start("testScene")
	}
}