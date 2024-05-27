class Test extends Phaser.Scene
{
	// Input
	/** @type {Phaser.Input.Keyboard.Key} */  upKey;
	/** @type {Phaser.Input.Keyboard.Key} */  leftKey;
	/** @type {Phaser.Input.Keyboard.Key} */  downKey;
	/** @type {Phaser.Input.Keyboard.Key} */  rightKey;
	/** @type {Phaser.Input.Keyboard.Key} */  dashKey;

	// Game Objects
	/** @type {Player} */  player;


	// Methods
	constructor()
	{
		super('testScene')
	}

	create()
	{
		// Set up input
		this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
		this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
		this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
		this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
		this.dashKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

		// Create player
		this.player = new Player(this, 100, 100);
	}

	update(time, delta)
	{
		this.player.update(delta);
	}
}