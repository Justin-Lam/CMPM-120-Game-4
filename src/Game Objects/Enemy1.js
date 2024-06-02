class Enemy1 extends Enemy
{
	// VARIABLES:

	// Stats
	MAX_HEALTH = 10;

	// Movement
	MAX_VELOCITY = 125;
	ACCELERATION = this.MAX_VELOCITY * 10;

	// Attack
	/** @type {Phaser.Physics.Arcade.Sprite} */  attackSwipe;
	DAMAGE = 3;
	EXECUTE_ATTACK_RANGE = 100;
	ATTACK_RANGE = 75;
	ATTACK_KNOCKBACK_VELOCITY = 1000;
	ATTACK_KNOCKBACK_DURATION = 0.15;				// in seconds
	ATTACK_BUILDUP_DURATION = 0.5;					// in seconds
	ATTACK_DURATION = 0.25;							// in seconds
	ATTACK_COOLDOWN = 2;							// in seconds
	attackBuildupDurationCounter = 0;
	attackDurationCounter = 0;
	attackCooldownCounter = 0;



	// METHODS:
	
	/** @param {Phaser.Scene} scene	@param {number} x	@param {number} y */
	constructor(scene, x, y)
	{
		// Call superclass's constructor
		super(scene, x, y, "Enemy1", 0);

		// Set stats
		this.health = this.MAX_HEALTH;

		// Set attack
		this.attackSwipe = scene.physics.add.sprite(-100, -100, "Net Swipe", 0);
		this.attackSwipe.setVisible(false);
		this.attackSwipe.setScale(1.5);
		this.attackSwipe.owner = this;
		this.attackSwipe.DAMAGE = this.DAMAGE;
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
		// Check that the enemy isn't stunned or being knocked back
		if (this.stunnedDurationCounter > 0 || this.knockbackDurationCounter > 0) {
			return;
		}
		// Check that the enemy isn't attacking
		if (this.attackBuildupDurationCounter > 0 || this.attackDurationCounter > 0) {
			return;
		}

		// Check if attack is off cooldown
		if (this.attackCooldownCounter <= 0)
		{
			// Check if enemy is in range of player to attack
			let dx = this.x - this.scene.player.x;
			let dy = this.y - this.scene.player.y;
			let distance = Math.sqrt(dx**2 + dy**2);
			if (distance <= this.EXECUTE_ATTACK_RANGE)
			{
				// Check that the player isn't dashing
				if (this.scene.player.dashDurationCounter <= 0)
				{
					// Stop moving
					this.body.setAcceleration(0, 0);
					this.body.setVelocity(0, 0);

					// Set attack buildup duration
					this.attackBuildupDurationCounter = this.ATTACK_BUILDUP_DURATION;
				}
				else
				{
					this.moveTowardsPlayer();
				}
			}
			else
			{
				this.moveTowardsPlayer();
			}
		}
		else
		{
			this.moveTowardsPlayer();
		}
	}

	moveTowardsPlayer()
	{
		// Set max velocity
		this.body.setMaxVelocity(this.MAX_VELOCITY);

		// Accelerate towards the player
		let dx = this.scene.player.x - this.x;
		let dy = this.scene.player.y - this.y;
		let magnitude = Math.sqrt(dx**2 + dy**2);
		let moveMagnitudeX = dx / magnitude;
		let moveMagnitudeY = dy / magnitude;
		let accelerationX = moveMagnitudeX * this.ACCELERATION;
		let accelerationY = moveMagnitudeY * this.ACCELERATION;
		this.body.setAcceleration(accelerationX, accelerationY);

		// Cap velocity so it doesn't exceed max velocity
		let velocityMagnitude = Math.sqrt(this.body.velocity.x**2 + this.body.velocity.y**2);
		if (velocityMagnitude > this.MAX_VELOCITY) {
			let maxCurrentVelocityRatio = this.MAX_VELOCITY / velocityMagnitude;
			let adjustedMaxVelocityX = this.body.velocity.x * maxCurrentVelocityRatio;
			let adjustedMaxVelocityY = this.body.velocity.y * maxCurrentVelocityRatio;
			this.body.setVelocity(adjustedMaxVelocityX, adjustedMaxVelocityY);
		}

		// Look in the direction of movement
		if (this.body.velocity.x > 0) {
			this.resetFlip();
		}
		else if (this.body.velocity.x < 0) {
			this.setFlip(true, false);
		}
	}

	attack()
	{
		// Set the position of the attack, capped by the range
		let dx = this.scene.player.x - this.x;
		let dy = this.scene.player.y - this.y;
		let angle = Math.atan2(dy, dx);
		dx = this.ATTACK_RANGE * Math.cos(angle);
		dy = this.ATTACK_RANGE * Math.sin(angle);
		let x = this.x + dx;
		let y = this.y + dy;
		this.attackSwipe.setPosition(x, y);

		// Set the angle, visibility, and duration of the attack
		let attackAngle = Phaser.Math.Angle.Between(this.x, this.y, this.scene.player.x, this.scene.player.y);
		attackAngle = Phaser.Math.RadToDeg(attackAngle);
		this.attackSwipe.setAngle(attackAngle);

		this.attackSwipe.setVisible(true);

		this.attackDurationCounter = this.ATTACK_DURATION;
	}

	/** @param {number} delta */
	handleBehaviorCounters(delta)
	{
		// delta is in ms, when we work with it we need to divide it by 1000 to get its value in seconds

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
			// Decrement counter until it's 0; hide the attack and put it on cooldown if so
			this.attackDurationCounter -= delta/1000;
			if (this.attackDurationCounter <= 0) {
				this.attackDurationCounter = 0;
				this.attackSwipe.setVisible(false);
				this.attackCooldownCounter = this.ATTACK_COOLDOWN;
			}
		}
		
		if (this.attackCooldownCounter > 0)
		{
			// Decrement counter until it's 0
			this.attackCooldownCounter -= delta/1000;
			if (this.attackCooldownCounter <= 0) {
				this.attackCooldownCounter = 0;
			}
		}
	}
}