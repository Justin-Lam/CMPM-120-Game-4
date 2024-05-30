class Test extends Phaser.Scene
{
	// Game Objects
	/** @type {Player} */  player;
	/** @type {Phaser.Physics.Arcade.Group} */  enemiesGroup;

	// Methods
	constructor()
	{
		super('testScene')
	}

	create()
	{
		// Create player
		this.player = new Player(this, 100, 100);

		// Create enemies
		this.enemies = [
			new Enemy(this, 500, 100),
			new Enemy(this, 600, 200),
			new Enemy(this, 700, 300),
			new Enemy(this, 800, 400),
			new Enemy(this, 900, 500)
		];
		this.enemiesGroup = this.physics.add.group(this.enemies);

		// Create collision handlers
		this.physics.add.collider(this.player, this.enemiesGroup);
	}

	update(time, delta)
	{
		this.player.update(delta);
	}
}