class Player extends Phaser.Physics.Arcade.Sprite
{
	// VARIABLES:

	// Stats
	MAX_HEALTH = 10;
	health = this.MAX_HEALTH;

	// Eight Direction Movement
	/** @type {Phaser.Input.Keyboard.Key} */  upKey;
	/** @type {Phaser.Input.Keyboard.Key} */  leftKey;
	/** @type {Phaser.Input.Keyboard.Key} */  downKey;
	/** @type {Phaser.Input.Keyboard.Key} */  rightKey;
	MAX_VELOCITY = 300;
	ACCELERATION = this.MAX_VELOCITY * 10;
	DRAG = this.ACCELERATION;
	TURNING_ACCELERATION_MULTIPLIER = 2.0;
	moveMagnitudeX = 0;
	moveMagnitudeY = 0;

	// Dash
	/** @type {Phaser.Input.Keyboard.Key} */  dashKey;
	DASH_VELOCITY = this.MAX_VELOCITY * 4.0;
	DASH_DURATION = 0.1;										// in seconds
	DASH_COOLDOWN = 1.0;										// in seconds
	dashDurationCounter = 0;
	dashCooldownCounter = 0;

	// Net
	/** @type {Phaser.Physics.Arcade.Sprite} */  netSwipe;
	NET_DAMAGE = 2.0;
	NET_RANGE = 50;												// in pixels
	NET_KNOCKBACK_VELOCITY = 500;
	NET_KNOCKBACK_DURATION = 0.15;								// in seconds
	NET_STUN_DURATION = 0.3;									// in seconds
	NET_DURATION = 0.15;										// in seconds
	NET_COOLDOWN = 0.35;										// in seconds
	netDurationCounter = 0;
	netCooldownCounter = 0;

	// Bread Gun 
	/** @type {Phaser.Physics.Arcade.Group} */  breadGroup;
	GUN_DAMAGE = 1.0;
	GUN_RANGE = 300;											// in pixels
	BREAD_VELOCITY = 500;
	GUN_MOVEMENT_IMPAIRMENT_DURATION = this.NET_DURATION;		// in seconds
	GUN_COOLDOWN = 0.75;										// in seconds
	gunMovementImpairmentDurationCounter = 0
	gunCooldownCounter = 0;

	// Getting Hurt
	INVINCIBILITY_DURATION = 0.25;
	NUM_INVINCIBILITY_FLASHES = 2;
	invincibilityDurationCounter = 0;
	invincibilityFlashDurationCounter = 0;
	knockbackDurationCounter = 0;


	// METHODS:

	/** @param {Phaser.Scene} scene    @param {number} x    @param {number} y */
	constructor(scene, x, y)
	{
		// Do necessary initial stuff
		super(scene, x, y, "Player", 0);
		scene.add.existing(this);
		scene.physics.add.existing(this);
		this.setCollideWorldBounds(true);

		// Set up body
		this.setPushable(false);

		// Set up eight direction movement
		this.upKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
		this.leftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
		this.downKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
		this.rightKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

		// Set up dash
		this.dashKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
		this.dashKey.on("down", () => {
			this.dash();
		});

		// Set up combat
		scene.input.on("pointerdown", (pointer) => {
			if (pointer.leftButtonDown()) {
				this.netAttack(pointer);
			}
			else if (pointer.rightButtonDown()) {
				this.gunAttack(pointer);
			}
		});
		this.netSwipe = scene.physics.add.sprite(-100, -100, "Net Swipe", 0);
		this.netSwipe.setVisible(false);
		this.breadGroup = scene.physics.add.group({
			maxSize: 50,
			runChildUpdate: true
		});
		this.breadGroup.createMultiple({
			classType: Bread,
			setXY: {x: -100, y: -100},
			key: "Bread",
			frame: 0,
			repeat: this.breadGroup.maxSize-1,
			active: false,
			visible: false
		});
		for (let bread of this.breadGroup.getChildren()) {
			bread.player = this;
		}

		// Return instance
		return this;
	}

	/** @param {number} delta */
	update(delta)
	{
		this.eightDirectionMovement();
		this.handleDashCounters(delta);
		this.handleNetCounters(delta);
		this.handleGunCounters(delta);
		this.handleHitByAttackCounters(delta);
	}

	eightDirectionMovement()
	{
		// Check that the player isn't being knocked back
		if (this.knockbackDurationCounter > 0) {
			return;
		}
		// Check that the player isn't dashing or attacking
		if (this.dashDurationCounter > 0 || this.netDurationCounter > 0 || this.gunMovementImpairmentDurationCounter > 0) {
			return;
		}

		// Set max velocity
		this.body.setMaxVelocity(this.MAX_VELOCITY);

		// Process input
		let moveDirectionX = 0;		// -1 = left, 0 = horizontal idle, 1 = right
		let moveDirectionY = 0;		// -1 = up, 0 = vertical idle, 1 = down
		this.moveMagnitudeX = moveDirectionX;
		this.moveMagnitudeY = moveDirectionY;
		if (this.upKey.isDown) {													// up
			moveDirectionY = -1;
		}
		if (this.leftKey.isDown) {													// left
			moveDirectionX = -1;
		}
		if (this.downKey.isDown) {													// down
			moveDirectionY = 1;
		}
		if (this.rightKey.isDown) {													// right
			moveDirectionX = 1;
		}

		// Execute movement
		if (moveDirectionX != 0 || moveDirectionY != 0)								// move
		{
			// Initialize variables
			this.moveMagnitudeX = moveDirectionX;
			this.moveMagnitudeY = moveDirectionY;
			let accelerationX = 0;
			let accelerationY = 0;

			// Check for diagonal movement; modify the move magnitudes and max velocity if so
			if (moveDirectionX != 0 && moveDirectionY != 0) {
				this.moveMagnitudeX /= Math.SQRT2;
				this.moveMagnitudeY /= Math.SQRT2;
				this.body.setMaxVelocity(this.MAX_VELOCITY / Math.SQRT2);
			}

			// Set acceleration values
			accelerationX = this.ACCELERATION * this.moveMagnitudeX;
			accelerationY = this.ACCELERATION * this.moveMagnitudeY;

			// Check for turning; apply the turning acceleration multiplier if so
			if (Math.sign(moveDirectionX) != Math.sign(this.body.velocity.x)) {
				accelerationX *= this.TURNING_ACCELERATION_MULTIPLIER;
			}
			if (Math.sign(moveDirectionY) != Math.sign(this.body.velocity.y)) {
				accelerationY *= this.TURNING_ACCELERATION_MULTIPLIER;
			}

			// Accelerate
			this.body.setAcceleration(accelerationX, accelerationY);
		}
		else																		// idle
		{
			this.body.setAcceleration(0, 0);
			this.body.setDrag(this.DRAG, this.DRAG);
		}
	}

	dash()
	{
		// Check that the player isn't being knocked back
		if (this.knockbackDurationCounter > 0) {
			return;
		}
		// Check that the player isn't attacking
		if (this.netDurationCounter > 0) {
			return;
		}
		// Check that the player is attempting to move
		if (this.moveMagnitudeX == 0 && this.moveMagnitudeY == 0) {
			return;
		}
		// Check that dash is off cooldown and isn't currently being used
		if (this.dashCooldownCounter > 0 || this.dashDurationCounter > 0) {
			return;
		}

		// Disable collision
		for (let collider of this.scene.playerDashDisableColliders) {
			collider.active = false;
		}

		// Dash
		this.body.setMaxVelocity(this.DASH_VELOCITY, this.DASH_VELOCITY);
		this.body.setVelocity(this.DASH_VELOCITY * this.moveMagnitudeX, this.DASH_VELOCITY * this.moveMagnitudeY);
		this.dashDurationCounter = this.DASH_DURATION;
	}

	/** @param {number} delta */
	handleDashCounters(delta)
	{
		// delta is in ms, when we work with it we need to divide it by 1000 to get its value in seconds
		
		if (this.dashDurationCounter > 0)				// player is dashing
		{
			// Decrement counter until it's 0; reactivate collision and put dash on cooldown if so
			this.dashDurationCounter -= delta/1000;
			if (this.dashDurationCounter <= 0) {
				this.dashDurationCounter = 0;
				for (let collider of this.scene.playerDashDisableColliders) {
					collider.active = true;
				}
				this.dashCooldownCounter = this.DASH_COOLDOWN;
			}
		}
		if (this.dashCooldownCounter > 0)				// dash is on cooldown
		{
			// Decrement counter until it's 0
			this.dashCooldownCounter -= delta/1000;
			if (this.dashCooldownCounter < 0) {
				this.dashCooldownCounter = 0;
			}
		}
	}

	/** @param {Phaser.Input.Pointer} pointer */
	netAttack(pointer)
	{
		// Check that the player isn't being knocked back
		if (this.knockbackDurationCounter > 0) {
			return;
		}
		// Check that the player isn't dashing
		if (this.dashDurationCounter > 0) {
			return;
		}
		// Check that the player isn't shooting bread
		if (this.gunMovementImpairmentDurationCounter > 0) {
			return;
		}
		// Check that the attack is off cooldown and isn't currently being used
		if (this.netCooldownCounter > 0 || this.netDurationCounter > 0) {
			return;
		}

		// Stop movement
		this.body.setAcceleration(0);
		this.body.setVelocity(0, 0);

		// Set the position of the swipe, capped by the range
		let dx = pointer.x - this.x;
		let dy = pointer.y - this.y;
		let distance = Math.sqrt(dx**2 + dy**2);

		if (distance > this.NET_RANGE) {
			let angle = Math.atan2(dy, dx);
			dx = this.NET_RANGE * Math.cos(angle);
			dy = this.NET_RANGE * Math.sin(angle);
		}

		let x = this.x + dx;
		let y = this.y + dy;
		this.netSwipe.setPosition(x, y);

		// Set the angle, visibility, and duration of the swipe
		let angle = Phaser.Math.Angle.Between(this.x, this.y, pointer.x, pointer.y);
		angle = Phaser.Math.RadToDeg(angle);
		this.netSwipe.setAngle(angle);

		this.netSwipe.setVisible(true);

		this.netDurationCounter = this.NET_DURATION;
	}

	/** @param {number} delta */
	handleNetCounters(delta)
	{
		// delta is in ms, when we work with it we need to divide it by 1000 to get its value in seconds

		if (this.netDurationCounter > 0)		// player is attacking
		{
			// Decrement counter until it's 0; hide the net swipe and put it on cooldown if so
			this.netDurationCounter -= delta/1000;
			if (this.netDurationCounter <= 0) 
			{
				this.netDurationCounter = 0;
				this.netSwipe.setVisible(false);
				this.netCooldownCounter = this.NET_COOLDOWN;
			}
		}
		if (this.netCooldownCounter > 0)		// net is on cooldown
		{
			// Decrement counter until it's 0
			this.netCooldownCounter -= delta/1000;
			if (this.netCooldownCounter < 0) {
				this.netCooldownCounter = 0;
			}
		}
	}

	/** @param {Phaser.Input.Pointer} pointer */
	gunAttack(pointer)
	{
		// Check that the player isn't being knocked back
		if (this.knockbackDurationCounter > 0) {
			return;
		}
		// Check that the player isn't dashing
		if (this.dashDurationCounter > 0) {
			return;
		}
		// Check that the player isn't swiping with net
		if (this.netDurationCounter > 0) {
			return;
		}
		// Check that the attack is off cooldown
		if (this.gunCooldownCounter > 0) {
			return;
		}

		// Stop movement
		this.body.setAcceleration(0);
		this.body.setVelocity(0, 0);

		// Get the first inactive bread
		let bread = this.breadGroup.getFirstDead();
		if (bread != null) {
			// Fire, impair the player's movement, and put the gun on cooldown
			bread.activate(pointer);
			this.gunMovementImpairmentDurationCounter = this.GUN_MOVEMENT_IMPAIRMENT_DURATION;
			this.gunCooldownCounter = this.GUN_COOLDOWN;
		}
		else {
			console.log("NOTIFICATION: Attempted to get a bread from breadGroup but there were none that were inactive");
		}
	}

	/** @param {number} delta */
	handleGunCounters(delta)
	{
		// delta is in ms, when we work with it we need to divide it by 1000 to get its value in seconds

		if (this.gunMovementImpairmentDurationCounter > 0)		// player is movement impaired
		{
			// Decrement counter until it's 0
			this.gunMovementImpairmentDurationCounter -= delta/1000;
			if (this.gunMovementImpairmentDurationCounter < 0) 
			{
				this.gunMovementImpairmentDurationCounter = 0;
			}
		}
		if (this.gunCooldownCounter > 0)							// gun is on cooldown
		{
			// Decrement counter until it's 0
			this.gunCooldownCounter -= delta/1000;
			if (this.gunCooldownCounter < 0) {
				this.gunCooldownCounter = 0;
			}
		}
	}

	/** @param {Phaser.Physics.Arcade.Sprite} attack */
	getHitByAttack(attack)
	{
		this.invincibilityDurationCounter = this.INVINCIBILITY_DURATION;
		this.invincibilityFlashDurationCounter = this.INVINCIBILITY_DURATION / (this.NUM_INVINCIBILITY_FLASHES * 2);
		this.getKnockedBack(attack);
		this.takeDamage(attack.DAMAGE);
	}

	/** @param {Phaser.Physics.Arcade.Sprite} attack */
	getKnockedBack(attack)
	{
		// Stop acceleration and set max velocity
		this.body.setAcceleration(0, 0);
		this.body.setMaxVelocity(attack.KNOCKBACK_VELOCITY);

		// Set trajectory
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

		// Check if the player died
		if (this.health <= 0)
		{
			this.health = 0;
			this.ACCELERATION = 0;
		}

		console.log("Player health: " + this.health);
	}

	/** @param {number} delta */
	handleHitByAttackCounters(delta)
	{
		// delta is in ms, when we work with it we need to divide it by 1000 to get its value in seconds

		// Invincibility
		if (this.invincibilityDurationCounter > 0)
		{
			// Invincibility Flashes
			this.invincibilityFlashDurationCounter -= delta/1000;
			if (this.invincibilityFlashDurationCounter <= 0) {
				this.setVisible(!this.visible);
				this.invincibilityFlashDurationCounter = this.INVINCIBILITY_DURATION / (this.NUM_INVINCIBILITY_FLASHES * 2);
			}

			// Invincility
			this.invincibilityDurationCounter -= delta/1000;
			if (this.invincibilityDurationCounter < 0) {
				this.invincibilityDurationCounter = 0;
				this.setVisible(true);
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
}