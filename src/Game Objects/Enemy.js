class Enemy extends Phaser.Physics.Arcade.Sprite
{
	// Constant Variables
	MAX_HEALTH = 5;

	// Dynamic Variables
	health = this.MAX_HEALTH;

	// Reference Variables


	// Methods
	/** @param {Phaser.Scene} scene	@param {number} x	@param {number} y */
	constructor(scene, x, y)
	{
		// Do necessary initial stuff
		super(scene, x, y, "none", 0);
		scene.add.existing(this);
		scene.physics.add.existing(this);

		// Return instance
		return this;
	}

	takeDamage(amount)
	{
		// Decrease health
		this.health -= amount;

		// Check if the enemy died
		if (this.health <= 0)
		{
			this.health = 0;
			this.destroy();
		}
	}
}