class Enemy extends Phaser.Physics.Arcade.Sprite
{
	// VARIABLES:

	// Body
	BODY_SIZE_RATIO = 0.5

	// Stats
	health = 0;

	// Attack Game Objects
	attackGameObjects = [];

	// Statuses
	invulnerableToNetDurationCounter = 0;
	knockbackDurationCounter = 0;
	stunnedDurationCounter = 0;

	// Patroling
	state = "patrolling";
	PATROL_MAX_VELOCITY = 100;
	PATROL_ACCELERATION = 250;
	PATROL_DRAG = this.PATROL_ACCELERATION;
	PATROL_MOVE_DURATION = 2;
	PATROL_MOVE_COOLDOWN = 2;
	PATROL_SURPRISE_DURATION = 1;
	patrolMoveDurationCounter = 0;
	patrolMoveCooldownCounter = 0;
	patrolSurpriseDurationCounter = 0;



	// METHODS:
	
	/** @param {Phaser.Scene} scene	@param {number} x	@param {number} y */
	constructor(scene, x, y, texture, frame)
	{
		// Do necessary initial stuff
		super(scene, x, y, texture, frame);
		scene.add.existing(this);
		scene.physics.add.existing(this);
		// collides with world bounds needs to be set in the enemy group's config

		// Set up body
		this.setPushable(false);
		this.setBodySize(this.displayWidth * this.BODY_SIZE_RATIO, this.displayHeight * this.BODY_SIZE_RATIO);

		// Return instance
		return this;
	}

	/** @param {number} delta */
	update(delta)
	{
		this.executeScanAndPatrol();
		this.handlePatrolCounters(delta);
		this.handleGetHitCounters(delta);
	}

	executeScanAndPatrol()
	{
		// Check that the enemy is patrolling
		if (this.state != "patrolling") {
			return;
		}

		// Check if enemy has spotted the player
		if (this.scene.cameras.main.worldView.contains(this.x, this.y)) {
			this.body.setAcceleration(0);
			this.body.setDrag(this.PATROL_DRAG);
			this.patrolMoveDurationCounter = 0;
			this.patrolMoveCooldownCounter = 0;
			this.patrolSurpriseDurationCounter = this.PATROL_SURPRISE_DURATION;
			this.state = "engaging";
		}
		else
		{
			this.patrol();
		}
	}

	patrol()
	{ 
		// Check if enemy is already patrolling or patrol is on cooldown
		if (this.patrolMoveDurationCounter > 0 || this.patrolMoveCooldownCounter > 0) {
			return;
		}

		// Choose move directions
		let moveDirectionX = Phaser.Math.Between(-1, 1);
		let moveDirectionY = Phaser.Math.Between(-1, 1);
		if (moveDirectionX == 0 && moveDirectionY == 0)
		{
			// if both move directions are 0, the enemy isn't going to move
			// so choose a random axis to force movement in
			let choice = Math.random();
			if (choice < 0.5)
			{
				let direction = Math.random();
				if (direction < 0.5) {
					moveDirectionX = -1;
				}
				else {
					moveDirectionX = 1;
				}
			}
			else
			{
				let direction = Math.random();
				if (direction < 0.5) {
					moveDirectionY = -1;
				}
				else {
					moveDirectionY = 1;
				}
			}
		}

		// Set max velocity
		if (moveDirectionX == 0 || moveDirectionY == 0) {		// moving straight
			this.body.setMaxVelocity(this.PATROL_MAX_VELOCITY);
		}
		else {													// moving diagonally
			this.body.setMaxVelocity(this.PATROL_MAX_VELOCITY / Math.SQRT2);
		}

		// Set acceleration
		this.body.setAcceleration(this.PATROL_ACCELERATION * moveDirectionX, this.PATROL_ACCELERATION * moveDirectionY);

		// Set patrol move duration counter
		this.patrolMoveDurationCounter = this.PATROL_MOVE_DURATION;
	}

	/** @param {number} delta */
	handlePatrolCounters(delta)
	{
		// delta is in ms, when we work with it we need to divide it by 1000 to get its value in seconds

		if (this.patrolMoveDurationCounter > 0)
		{
			this.patrolMoveDurationCounter -= delta/1000;
			if (this.patrolMoveDurationCounter <= 0) {
				this.patrolMoveDurationCounter = 0;
				this.body.setAcceleration(0);
				this.body.setDrag(this.PATROL_DRAG);
				this.patrolMoveCooldownCounter = this.PATROL_MOVE_COOLDOWN;
			}
		}
		if (this.patrolMoveCooldownCounter > 0)
		{
			this.patrolMoveCooldownCounter -= delta/1000;
			if (this.patrolMoveCooldownCounter <= 0) {
				this.patrolMoveCooldownCounter = 0;
			}
		}
		if (this.patrolSurpriseDurationCounter > 0)
		{
			this.patrolSurpriseDurationCounter -= delta/1000;
			if (this.patrolSurpriseDurationCounter <= 0) {
				this.patrolSurpriseDurationCounter = 0;
				if (!this.scene.cameras.main.worldView.contains(this.x, this.y)) {
					this.state = "patrolling";
				}
			}
		}
	}

	/** @param {Phaser.Physics.Arcade.Sprite} attack    @param {string} attackType */
	getHitByAttack(attack, attackType)
	{
		if (attackType == "net") {
			if (this.invulnerableToNetDurationCounter > 0) {
				return;
			}
			this.invulnerableToNetDurationCounter = this.scene.player.NET_DURATION;
			this.stunnedDurationCounter = this.scene.player.NET_STUN_DURATION;
		}
		this.getKnockbacked(attack);
		this.takeDamage(attack.DAMAGE);
	}

	/** @param {Phaser.Physics.Arcade.Sprite} attack */
	getKnockbacked(attack)
	{
		// Stop acceleration and set max velocity
		this.body.setAcceleration(0, 0);
		this.body.setMaxVelocity(attack.KNOCKBACK_VELOCITY);

		// Set the trajectory of the enemy
		let dx = this.x - attack.owner.x;
		let dy = this.y - attack.owner.y;
		let magnitude = Math.sqrt(dx**2 + dy**2);
		let moveMagnitudeX = dx / magnitude;
		let moveMagnitudeY = dy / magnitude;
		let velocityX = moveMagnitudeX * attack.KNOCKBACK_VELOCITY;
		let velocityY = moveMagnitudeY * attack.KNOCKBACK_VELOCITY;
		this.body.setVelocity(velocityX, velocityY);
		
		// Set knockback duration counter
		this.knockbackDurationCounter = attack.KNOCKBACK_DURATION;
	}

	/** @param {number} amount */
	takeDamage(amount)
	{
		// Decrease health
		this.health -= amount;

		// Check if the enemy died
		if (this.health <= 0)
		{
			this.health = 0;
			for (let attackGameObject of this.attackGameObjects) {
				attackGameObject.destroy();
			}
			this.destroy();
		}
	}

	/** @param {number} delta */
	handleGetHitCounters(delta)
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