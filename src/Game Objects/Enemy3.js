class Enemy3 extends Enemy
{
	// VARIABLES:

	// Stats
	MAX_HEALTH = 10;

	// Charge
	CHARGE_MAX_VELOCITY = 500;
	CHARGE_ACCELERATION = 1000;
	CHARGE_DRAG = 500;
	CHARGE_DAMAGE = 2;
	CHARGE_KNOCKBACK_VELOCITY = 1500;
	CHARGE_KNOCKBACK_DURATION = 0.25;				// in seconds
	CHARGE_DURATION = 1;							// in seconds
	CHARGE_COOLDOWN = 2;							// in seconds
	chargeDurationCounter = 0;
	chargeCooldownCounter = this.CHARGE_COOLDOWN;
	moveMagnitudeX = 0;
	moveMagnitudeY = 0;
	adjustedMaxVelocityX = 0;
	adjustedMaxVelocityY = 0;
	accelerationX = 0;
	accelerationY = 0;

	// Attack
	/** @type {Phaser.Physics.Arcade.Sprite} */  attackSwipe;
	ATTACK_DAMAGE = 4;
	ATTACK_KNOCKBACK_VELOCITY = 1500;
	ATTACK_KNOCKBACK_DURATION = 0.15;				// in seconds
	ATTACK_BUILDUP_DURATION = 1;					// in seconds
	ATTACK_DURATION = 0.5;							// in seconds
	attackBuildupDurationCounter = 0;
	attackDurationCounter = 0;



	// METHODS:
	
	/** @param {Phaser.Scene} scene	@param {number} x	@param {number} y */
	constructor(scene, x, y)
	{
		// Call superclass's constructor
		super(scene, x, y, "Enemy3", 0);

		// Set stats
		this.health = this.MAX_HEALTH;

		// Set attack
		this.attackSwipe = scene.physics.add.sprite(-100, -100, "Net Swipe", 0);
		this.attackSwipe.setVisible(false);
		this.attackSwipe.setScale(3);
		this.attackSwipe.owner = this;
		this.attackSwipe.DAMAGE = this.ATTACK_DAMAGE;
		this.attackSwipe.KNOCKBACK_VELOCITY = this.ATTACK_KNOCKBACK_VELOCITY;
		this.attackSwipe.KNOCKBACK_DURATION = this.ATTACK_KNOCKBACK_DURATION;
		this.scene.enemyAttackGroup.add(this.attackSwipe);

		// Return instance
		return this;
	}

	/** @param {number} delta */
	update(delta)
	{
		super.update(delta);
		this.executeBehavior();
		this.handleBehaviorCounters(delta);
	}

	executeBehavior()
	{
		// Check that the enemy is engaging
		if (this.state != "engaging" || this.patrolSurpriseDurationCounter > 0) {
			return;
		}
		// Check that the enemy isn't stunned or being knocked back
		if (this.stunnedDurationCounter > 0 || this.knockbackDurationCounter > 0) {
			return;
		}
		// Check that the enemy isn't charging or attacking
		if (this.chargeDurationCounter > 0 || this.attackBuildupDurationCounter > 0 || this.attackDurationCounter > 0) {
			return;
		}
		// Check that charge is off cooldown
		if (this.chargeCooldownCounter > 0) {
			return;
		}

		// Charge
		this.charge();
	}

	charge()
	{
		// Get move magnitudes
		let dx = this.scene.player.x - this.x;
		let dy = this.scene.player.y - this.y;
		let magnitude = Math.sqrt(dx**2 + dy**2);
		this.moveMagnitudeX = dx / magnitude;
		this.moveMagnitudeY = dy / magnitude;

		// Set max velocity
		this.adjustedMaxVelocityX = Math.abs(this.CHARGE_MAX_VELOCITY * this.moveMagnitudeX);
		this.adjustedMaxVelocityY = Math.abs(this.CHARGE_MAX_VELOCITY * this.moveMagnitudeY);

		// Set acceleration
		this.accelerationX = this.moveMagnitudeX * this.CHARGE_ACCELERATION;
		this.accelerationY = this.moveMagnitudeY * this.CHARGE_ACCELERATION;

		// Look in the direction of movement
		if (Math.sign(dx) > 0) {
			this.resetFlip();
		}
		else if (Math.sign(dx) < 0) {
			this.setFlip(true, false);
		}

		// Set charge duration counter
		this.chargeDurationCounter = this.CHARGE_DURATION;
	}

	attack()
	{
		// Set the position, angle, visibility, and duration of the attack
		this.attackSwipe.setPosition(this.x, this.y);
		let attackAngle = Phaser.Math.Angle.Between(this.x, this.y, this.x + this.moveMagnitudeX, this.y + this.moveMagnitudeY);
		attackAngle = Phaser.Math.RadToDeg(attackAngle);
		this.attackSwipe.setAngle(attackAngle);
		this.attackSwipe.setVisible(true);
		this.attackDurationCounter = this.ATTACK_DURATION;
	}

	/** @param {number} delta */
	handleBehaviorCounters(delta)
	{
		// delta is in ms, when we work with it we need to divide it by 1000 to get its value in seconds

		if (this.chargeDurationCounter > 0)
		{
			// Accelerate
			if (this.knockbackDurationCounter <= 0) {
				this.body.setMaxVelocity(this.adjustedMaxVelocityX, this.adjustedMaxVelocityY);
				this.body.setAcceleration(this.accelerationX, this.accelerationY);
			}

			// Decrement counter until it's 0
			this.chargeDurationCounter -= delta/1000;
			if (this.chargeDurationCounter <= 0) {
				this.chargeDurationCounter = 0;
				this.body.setAcceleration(0);
				this.body.setDrag(this.CHARGE_DRAG);
				this.attackBuildupDurationCounter = this.ATTACK_BUILDUP_DURATION;
			}
		}
		if (this.attackBuildupDurationCounter > 0)
		{
			// Decrement counter until it's 0; attack if so
			this.attackBuildupDurationCounter -= delta/1000;
			if (this.attackBuildupDurationCounter <= 0) {
				this.attackBuildupDurationCounter = 0;
				this.attack();
			}
		}
		if (this.attackDurationCounter > 0)
		{
			// Rotate the attack swipe
			this.attackSwipe.angle += (360 / this.ATTACK_DURATION) * (delta/1000);

			// Decrement counter until it's 0; reset the attack's angle, hide it, and put it on cooldown if so
			this.attackDurationCounter -= delta/1000;
			if (this.attackDurationCounter <= 0) {
				this.attackDurationCounter = 0;
				this.attackSwipe.angle = 0;
				this.attackSwipe.setVisible(false);
				this.chargeCooldownCounter = this.CHARGE_COOLDOWN;
				if (!this.scene.cameras.main.worldView.contains(this.x, this.y)) {
					this.state = "patrolling";
				}
			}
		}
		if (this.chargeCooldownCounter > 0)
		{
			// Decrement counter until it's 0
			this.chargeCooldownCounter -= delta/1000;
			if (this.chargeCooldownCounter < 0) {
				this.chargeCooldownCounter = 0;
			}
		}
	}
}