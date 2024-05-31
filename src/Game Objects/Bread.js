class Bread extends Phaser.Physics.Arcade.Sprite
{
	// VARIABLES:

	/** @type {Player} */  player;
	startX = 0;
	startY = 0;



	// METHODS:

	/** @param {Phaser.Input.Pointer} pointer */
	activate(pointer)
	{
		// Activate, show, and set the position of the bread
		this.setActive(true);
		this.setVisible(true);
		this.setPosition(this.player.x, this.player.y);
		this.startX = this.player.x;
		this.startY = this.player.y;

		// Set the trajectory of the bread
		let dx = pointer.x - this.player.x;
		let dy = pointer.y - this.player.y;
		let magnitude = Math.sqrt(dx**2 + dy**2);
		let moveMagnitudeX = dx / magnitude;
		let moveMagnitudeY = dy / magnitude;
		let velocityX = moveMagnitudeX * this.player.BREAD_VELOCITY;
		let velocityY = moveMagnitudeY * this.player.BREAD_VELOCITY;
		this.body.setVelocity(velocityX, velocityY);
	}

	deactivate()
	{
		this.setActive(false);
		this.setVisible(false);
		this.body.setVelocity(0, 0);
	}

	update()
	{
		// Check if the bullet needs to deactivate due to going out of range
		let dx = this.x - this.startX;
		let dy = this.y - this.startY;
		let distanceTraveled = Math.sqrt(dx**2 + dy**2);
		if (distanceTraveled >= this.player.GUN_RANGE) {
			this.deactivate();
		}

		// Temporary: deactivate bread when it leaves the screen
		// Later on into development need to deactivate the bread when it collides with the walls of the dungeon
		if (this.x < -this.displayWidth/2 || this.x > game.config.width + this.displayWidth/2 || this.y < -this.displayHeight/2 || this.y > game.config.height + this.displayHeight/2) {
			this.deactivate();
		}
	}
}