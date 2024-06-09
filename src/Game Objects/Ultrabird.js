class Ultrabird extends Phaser.Physics.Arcade.Sprite
{
	// VARIABLES:

	// State
	INACTIVE_DURATION = 3;
	inactiveDurationCounter = 0;

	// Health
	MAX_HEALTH = 500;
	health = this.MAX_HEALTH;



	// METHODS:

	/** @param {Phaser.Scene} scene	   @param {number} x    @param {number} y */
	constructor(scene, x, y)
	{
		// Do necessary initial stuff
		super(scene, x, y, "Ultrabird", 0);
		scene.add.existing(this);
		scene.physics.add.existing(this);
		this.setCollideWorldBounds(true);

		// Set body
		this.setPushable(false);

		// Disable
		this.setActive(false);
		this.setVisible(false);

		// Return instance
		return this;
	}

	onDiscovered()
	{
		this.setVisible(true);
		this.inactiveDurationCounter = this.INACTIVE_DURATION;
	}
	handleInactiveCounters(delta)
	{
		if (this.inactiveDurationCounter > 0) {
			this.inactiveDurationCounter -= delta/1000;
			if (this.inactiveDurationCounter <= 0) {
				this.inactiveDurationCounter = 0;
				this.setActive(true);
				this.scene.ultrabirdHealthText.setVisible(true);
			}
		}
	}

	update(delta)
	{
		// Handle inactive counters
		this.handleInactiveCounters(delta);
	}
}