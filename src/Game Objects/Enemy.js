class Enemy extends Phaser.Physics.Arcade.Sprite
{
	// VARIABLES:

	// Stats
	MAX_HEALTH = 5;
	health = this.MAX_HEALTH;
	DAMAGE = 2;

	// Player
	/** @type {Player} */  player;

	// Statuses
	knockbackDurationCounter = 0.0;
	INVULNERABLE_TO_NET_DURATION = 0.1;
	invulnerableToNetDurationCounter = 0.0;



	// METHODS:
	
	/** @param {Phaser.Scene} scene	@param {number} x	@param {number} y */
	constructor(scene, x, y)
	{
		// Do necessary initial stuff
		super(scene, x, y, "Enemy", 0);
		scene.add.existing(this);
		scene.physics.add.existing(this);

		// Set up body
		this.setPushable(false);

		// Get reference to player
		this.player = this.scene.player;

		// Return instance
		return this;
	}

	update(delta)
	{
		this.handleHitByNetCounters(delta);
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

	getHitByNet(damage)
	{
		this.getKnockbacked();
		this.invulnerableToNetDurationCounter = this.INVULNERABLE_TO_NET_DURATION;
		this.takeDamage(damage);
	}

	getKnockbacked()
	{
		// Set the trajectory of the enemy
		let dx = this.x - this.player.x;
		let dy = this.y - this.player.y;
		let magnitude = Math.sqrt(dx**2 + dy**2);
		let moveMagnitudeX = dx / magnitude;
		let moveMagnitudeY = dy / magnitude;
		let velocityX = moveMagnitudeX * this.player.NET_KNOCKBACK_VELOCITY;
		let velocityY = moveMagnitudeY * this.player.NET_KNOCKBACK_VELOCITY;
		this.body.setVelocity(velocityX, velocityY);
		
		// Set knockback duration counter
		this.knockbackDurationCounter = this.player.NET_KNOCKBACK_DURATION;
	}

	handleHitByNetCounters(delta)
	{
		// delta is in ms, when we work with it we need to divide it by 1000 to get its value in seconds

		// Knockback
		if (this.knockbackDurationCounter > 0.0)
		{
			this.knockbackDurationCounter -= delta/1000;
			if (this.knockbackDurationCounter <= 0.0) {
				this.knockbackDurationCounter = 0.0;
				this.body.setVelocity(0, 0);
			}
		}

		// Invulnerable To Net
		if (this.invulnerableToNetDurationCounter > 0.0)
		{
			this.invulnerableToNetDurationCounter -= delta/1000;
			if (this.invulnerableToNetDurationCounter <= 0.0) {
				this.invulnerableToNetDurationCounter = 0.0;
			}
		}
	}
}