class Player extends Phaser.Physics.Arcade.Sprite
{
	// Constant Variables
	#MAX_VELOCITY = 300;
	#ACCELERATION = this.#MAX_VELOCITY * 10;
	#DRAG = this.#ACCELERATION;
	#TURNING_ACCELERATION_MULTIPLIER = 2.0;

	#DASH_VELOCITY = this.#MAX_VELOCITY * 5.0;
	#DASH_DURATION = 0.15;
	#DASH_COOLDOWN = 1.0;

	// Dynamic Variables
	#moveMagnitudeX = 0.0;
	#moveMagnitudeY = 0.0;
	#dashDurationCounter = 0.0;
	#dashCooldownCounter = 0.0;

	// Reference Variables
	/** @type {Phaser.Input.Keyboard.Key} */  #upKey;
	/** @type {Phaser.Input.Keyboard.Key} */  #leftKey;
	/** @type {Phaser.Input.Keyboard.Key} */  #downKey;
	/** @type {Phaser.Input.Keyboard.Key} */  #rightKey;
	/** @type {Phaser.Input.Keyboard.Key} */  #dashKey;


	// Methods
	constructor(scene, x, y)
	{
		// Do necessary initial stuff
		super(scene, x, y, "none", 0);
		scene.add.existing(this);
		scene.physics.add.existing(this);
		this.setCollideWorldBounds(true);

		// Set up input
		this.#upKey = scene.upKey;
		this.#leftKey = scene.leftKey;
		this.#downKey = scene.downKey;
		this.#rightKey = scene.rightKey;
		this.#dashKey = scene.dashKey;

		this.#dashKey.on("down", () => {
			// Check that the player is moving, dash is off cooldown, and the player isn't already dashing
			if (this.body.velocity != Phaser.Math.Vector2.ZERO && this.#dashCooldownCounter <= 0.0 && this.#dashDurationCounter <= 0.0)
			{
				this.body.setMaxVelocity(this.#DASH_VELOCITY, this.#DASH_VELOCITY);
				this.body.setVelocity(this.#DASH_VELOCITY * this.#moveMagnitudeX, this.#DASH_VELOCITY * this.#moveMagnitudeY);
				this.#dashDurationCounter = this.#DASH_DURATION;
			}
		});

		// Set up physics
		this.body.setMaxVelocity(this.#MAX_VELOCITY);

		// Return instance
		return this;
	}

	update(delta)
	{
		this.eightDirectionMovement();
		this.handleDashCounters(delta);
	}

	eightDirectionMovement()
	{
		// Check if the player is dashing; don't allow eight direction movement if so
		if (this.#dashDurationCounter > 0.0) {
			return;
		}

		// Set max velocity
		this.body.setMaxVelocity(this.#MAX_VELOCITY);

		// Process input
		let moveDirectionX = 0;		// -1 = left, 0 = horizontal idle, 1 = right
		let moveDirectionY = 0;		// -1 = up, 0 = vertical idle, 1 = down
		if (this.#upKey.isDown) {													// up
			moveDirectionY = -1;
		}
		if (this.#leftKey.isDown) {													// left
			moveDirectionX = -1;
		}
		if (this.#downKey.isDown) {													// down
			moveDirectionY = 1;
		}
		if (this.#rightKey.isDown) {													// right
			moveDirectionX = 1;
		}

		// Execute movement
		if (moveDirectionX != 0 || moveDirectionY != 0)								// move
		{
			// Initialize variables
			this.#moveMagnitudeX = moveDirectionX;
			this.#moveMagnitudeY = moveDirectionY;
			let accelerationX = 0;
			let accelerationY = 0;

			// Check for diagonal movement; modify the move magnitudes and max velocity if so
			if (moveDirectionX != 0 && moveDirectionY != 0) {
				this.#moveMagnitudeX /= Math.SQRT2;
				this.#moveMagnitudeY /= Math.SQRT2;
				this.body.setMaxVelocity(this.#MAX_VELOCITY / Math.SQRT2);
			}

			// Set acceleration values
			accelerationX = this.#ACCELERATION * this.#moveMagnitudeX;
			accelerationY = this.#ACCELERATION * this.#moveMagnitudeY;

			// Check for turning; apply the turning acceleration multiplier if so
			if (Math.sign(moveDirectionX) != Math.sign(this.body.velocity.x)) {
				accelerationX *= this.#TURNING_ACCELERATION_MULTIPLIER;
			}
			if (Math.sign(moveDirectionY) != Math.sign(this.body.velocity.y)) {
				accelerationY *= this.#TURNING_ACCELERATION_MULTIPLIER;
			}

			// Accelerate
			this.body.setAcceleration(accelerationX, accelerationY);
		}
		else																		// idle
		{
			this.body.setAcceleration(0, 0);
			this.body.setDrag(this.#DRAG, this.#DRAG);
		}
	}

	handleDashCounters(delta)
	{
		// delta is in ms, when we work with it we need to divide it by 1000 to get its value in seconds
		
		if (this.#dashDurationCounter > 0.0)				// player is dashing
		{
			// Decrement counter until it's 0; put dash on cooldown if so
			this.#dashDurationCounter -= delta/1000;
			if (this.#dashDurationCounter <= 0) {
				this.#dashDurationCounter = 0;
				this.#dashCooldownCounter = this.#DASH_COOLDOWN;
			}
		}
		if (this.#dashCooldownCounter > 0.0)				// dash is on cooldown
		{
			// Decrement counter until it's 0
			this.#dashCooldownCounter -= delta/1000;
			if (this.#dashCooldownCounter < 0) {
				this.#dashCooldownCounter = 0;
			}
		}
	}
}