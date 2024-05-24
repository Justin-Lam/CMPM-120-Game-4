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
	}

	create()
	{
		// Start the first scene
		//this.scene.start("firstScene")
	}
}