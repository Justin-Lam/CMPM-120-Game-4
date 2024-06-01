class Enemy extends Phaser.Physics.Arcade.Sprite
{
	// VARIABLES:

	// Body
	BODY_SIZE_RATIO = 0.5

	// Stats
	health = 0;

	// Statuses
	invulnerableToNetDurationCounter = 0;
	knockbackDurationCounter = 0;
	stunnedDurationCounter = 0;



	// METHODS:
	
	/** @param {Phaser.Scene} scene	@param {number} x	@param {number} y */
	constructor(scene, x, y, texture, frame)
	{
		// Do necessary initial stuff
		super(scene, x, y, texture, frame);
		scene.add.existing(this);
		scene.physics.add.existing(this);

		// Set up body
		this.setPushable(false);
		this.setBodySize(this.displayWidth * this.BODY_SIZE_RATIO, this.displayHeight * this.BODY_SIZE_RATIO);
	}

	update(delta)
	{
		this.handleHitByNetCounters(delta);
	}

	getHitByNet(damage)
	{
		this.invulnerableToNetDurationCounter = this.scene.player.NET_DURATION;
		this.stunnedDurationCounter = this.scene.player.NET_STUN_DURATION;
		this.getKnockbacked();
		this.takeDamage(damage);
	}

	getKnockbacked()
	{
		// Stop acceleration and set max velocity
		this.body.setAcceleration(0, 0);
		this.body.setMaxVelocity(this.scene.player.NET_KNOCKBACK_VELOCITY);

		// Set the trajectory of the enemy
		let dx = this.x - this.scene.player.x;
		let dy = this.y - this.scene.player.y;
		let magnitude = Math.sqrt(dx**2 + dy**2);
		let moveMagnitudeX = dx / magnitude;
		let moveMagnitudeY = dy / magnitude;
		let velocityX = moveMagnitudeX * this.scene.player.NET_KNOCKBACK_VELOCITY;
		let velocityY = moveMagnitudeY * this.scene.player.NET_KNOCKBACK_VELOCITY;
		this.body.setVelocity(velocityX, velocityY);
		
		// Set knockback duration counter
		this.knockbackDurationCounter = this.scene.player.NET_KNOCKBACK_DURATION;
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

	handleHitByNetCounters(delta)
	{
		// delta is in ms, when we work with it we need to divide it by 1000 to get its value in seconds

		// Invulnerable To Net
		if (this.invulnerableToNetDurationCounter > 0)
		{
			this.invulnerableToNetDurationCounter -= delta/1000;
			if (this.invulnerableToNetDurationCounter < 0) {
				this.invulnerableToNetDurationCounter = 0;
			}
		}

		// Stunned
		if (this.stunnedDurationCounter > 0)
		{
			this.stunnedDurationCounter -= delta/1000;
			if (this.stunnedDurationCounter < 0) {
				this.stunnedDurationCounter = 0;
			}
		}

		// Knockback
		if (this.knockbackDurationCounter > 0)
		{
			this.knockbackDurationCounter -= delta/1000;
			if (this.knockbackDurationCounter <= 0) {
				this.knockbackDurationCounter = 0;
				this.body.setAcceleration(0, 0);
				this.body.setVelocity(0, 0);
			}
		}
	}

	executeBehavior() {}		// to be overwritten by the extend class
}