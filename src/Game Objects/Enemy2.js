class Enemy2 extends Enemy
{
	// VARIABLES:

	// Stats
	MAX_HEALTH = 45;

	// Move
	FLEE_RANGE = 500;
	MOVE_MAX_VELOCITY = 350;
	MOVE_ACCELERATION = 750;
	MOVE_DRAG = this.MOVE_ACCELERATION;
	MOVE_DURATION = 1;
	MOVE_COOLDOWN = 1;
	moveDurationCounter = 0;
	moveCooldownCounter = 0;

	// Attack
	ATTACK_RANGE = 1000;
	ATTACK_BUILDUP_DURATION = 0.5;			// in seconds
	SHOT_COOLDOWN = 0.25;               	// in seconds
	ATTACK_COOLDOWN = 4;					// in seconds
	attackBuildupDurationCounter = 0;
	shootCooldownCounter = 0;
	attackCooldownCounter = 0;

	// Poop
	NUM_POOP = 3;
	POOP_DAMAGE = 1;
	POOP_RANGE = 750;
	POOP_VELOCITY = 500;
	POOP_KNOCKBACK_VELOCITY = 1000;
	POOP_KNOCKBACK_DURATION = 0.05;			// in seconds
	poopFired = 0;



	// METHODS:
	
	/** @param {Phaser.Scene} scene	@param {number} x	@param {number} y */
	constructor(scene, x, y)
	{
		// Call superclass's constructor
		super(scene, x, y, "poopybird_spritesheet", 0);
		this.setScale(1.25);

		// Set stats
		this.health = this.MAX_HEALTH;

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
		// Check that the enemy isn't being knocked back
		if (this.knockbackDurationCounter > 0) {
			return;
		}
		// Check that the enemy isn't attacking
		if (this.attackBuildupDurationCounter > 0 || this.shootCooldownCounter > 0) {
			return;
		}
		// Check that the enemy isn't moving
		if (this.moveDurationCounter > 0) {
			return;
		}

		// Check if attack is off cooldown
		if (this.attackCooldownCounter <= 0)
		{
			// Check if enemy is in range of player to attack
			let dx = this.x - this.scene.player.x;
			let dy = this.y - this.scene.player.y;
			let distance = Math.sqrt(dx**2 + dy**2);
			if (distance <= this.ATTACK_RANGE)
			{
				// Stop moving
				this.body.setAcceleration(0, 0);
				this.body.setDrag(this.MOVE_DRAG);

				// Set attack buildup duration
				this.attackBuildupDurationCounter = this.ATTACK_BUILDUP_DURATION;
			}
			else
			{
				if (this.moveCooldownCounter <= 0) {
					this.move();
				}
			}
		}
		else
		{
			if (this.moveCooldownCounter <= 0) {
				this.move();
			}
		}
	}

	move()
	{
		if(this.anims.getName() != 'enemy2_attack' && this.anims.getName() != 'enemy2_hurt'){
			this.anims.play('enemy2_idle');
		}
		// Set max velocity
		this.body.setMaxVelocity(this.MOVE_MAX_VELOCITY / Math.SQRT2);

		// Get move directions
		let moveDirectionX = Math.sign(this.scene.player.x - this.x);		// -1 = left, 0 = random either, 1 = right
		let moveDirectionY = Math.sign(this.scene.player.y - this.y);		// -1 = up, 0 = random either, 1 = down

		// Check if any move direction is 0; make it randomly either -1 or 1 if so
		if (moveDirectionX == 0) {
			let direction = Math.random();
			if (direction < 0.5) {
				direction = -1;
			}
			else {
				direction = 1;
			}
			moveDirectionX = direction;
		}
		if (moveDirectionY == 0) {
			let direction = Math.random();
			if (direction < 0.5) {
				direction = -1;
			}
			else {
				direction = 1;
			}
			moveDirectionY = direction;
		}

		// Check if the enemy is within flee range from the player; reverse the move directions if so
		let dx = this.x - this.scene.player.x;
		let dy = this.y - this.scene.player.y;
		let distanceFromPlayer = Math.sqrt(dx**2 + dy**2);
		if (distanceFromPlayer <= this.FLEE_RANGE) {
			moveDirectionX *= -1;
			moveDirectionY *= -1;
		}

		// Accelerate
		let accelerationX = (this.MOVE_ACCELERATION * moveDirectionX) / Math.SQRT2;
		let accelerationY = (this.MOVE_ACCELERATION * moveDirectionY) / Math.SQRT2;
		this.body.setAcceleration(accelerationX, accelerationY);

		// Set move duration counter
		this.moveDurationCounter = this.MOVE_DURATION;
	}

	attack()
	{
		if(this.anims.getName() != 'enemy2_hurt'){
			this.anims.play('enemy2_attack');
		}
		this.playAfterDelay('enemy2_idle', 70);
		// Get the first inactive poop
		let poop = this.scene.enemy2PoopGroup.getFirstDead();
		if (poop != null)
		{
			// Fire
			poop.activate(this, this.x, this.y, this.scene.player.x, this.scene.player.y, this.POOP_VELOCITY, this.POOP_RANGE, this.POOP_KNOCKBACK_VELOCITY,
				this.POOP_KNOCKBACK_DURATION, this.POOP_DAMAGE);

			// Increment bullets fired and put attack on a cooldown
			this.poopFired++;
			if (this.poopFired < this.NUM_POOP) {
				this.shootCooldownCounter = this.SHOT_COOLDOWN;
			}
			else {
				this.poopFired = 0;
				this.attackCooldownCounter = this.ATTACK_COOLDOWN;
			}
		}
		else {
			console.log("NOTIFICATION: Attempted to get a bread from breadGroup but there were none that were inactive");
		}
	}

	/** @param {number} delta */
	handleBehaviorCounters(delta)
	{
		// delta is in ms, when we work with it we need to divide it by 1000 to get its value in seconds

		// Movement
		if (this.moveDurationCounter > 0)
		{
			this.moveDurationCounter -= delta/1000;
			if (this.moveDurationCounter <= 0) {
				this.moveDurationCounter = 0;
				this.body.setAcceleration(0, 0);
				this.body.setDrag(this.MOVE_DRAG);
				this.moveCooldownCounter = this.MOVE_COOLDOWN;
			}
		}
		if (this.moveCooldownCounter > 0)
		{
			this.moveCooldownCounter -= delta/1000;
			if (this.moveCooldownCounter < 0) {
				this.moveCooldownCounter = 0;
				if (!this.scene.cameras.main.worldView.contains(this.x, this.y)) {
					this.state = "patrolling";
				}
			}
		}

		// Attack
		if (this.attackBuildupDurationCounter > 0)
		{
			this.attackBuildupDurationCounter -= delta/1000;
			if (this.attackBuildupDurationCounter <= 0) {
				this.attackBuildupDurationCounter = 0;
				this.attack();
			}
		}
		if (this.shootCooldownCounter > 0)
		{
			this.shootCooldownCounter -= delta/1000;
			if (this.shootCooldownCounter <= 0) {
				this.shootCooldownCounter = 0;
				this.attack();
			}
		}
		if (this.attackCooldownCounter > 0)
		{
			this.attackCooldownCounter -= delta/1000;
			if (this.attackCooldownCounter < 0) {
				this.attackCooldownCounter = 0;
			}
		}
	}
	getHitByAttack(attack, attackType)
	{
		this.anims.play('enemy2_hurt');
		this.playAfterDelay('enemy2_idle', 70);
		if (attackType == "net") {
			if (this.invulnerableToNetDurationCounter > 0) {
				return;
			}
			this.invulnerableToNetDurationCounter = this.scene.player.NET_DURATION;
		}
		this.getKnockbacked(attack);
		this.takeDamage(attack.DAMAGE);
	}
}