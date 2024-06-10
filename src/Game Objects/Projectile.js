class Projectile extends Phaser.Physics.Arcade.Sprite
{
	// VARIABLES:

	owner = null;
	startX = 0;
	startY = 0;
	range = 0;
	KNOCKBACK_VELOCITY = 0;
	KNOCKBACK_DURATION = 0;
	DAMAGE = 0;



	// METHODS:

	activate(owner, startX, startY, targetX, targetY, velocity, range, knockbackVelocity, knockbackDuration, damage)
	{
		// Set variables
		this.owner = owner;
		this.startX = startX;
		this.startY = startY;
		this.range = range;
		this.KNOCKBACK_VELOCITY = knockbackVelocity;
		this.KNOCKBACK_DURATION = knockbackDuration;
		this.DAMAGE = damage

		// Activate, show, and set the position of the projectile
		this.setActive(true);
		this.setVisible(true);
		this.setPosition(startX, startY);
		this.depth = 6;

		// Set the trajectory of the bread
		let dx = targetX - startX;
		let dy = targetY - startY;
		let magnitude = Math.sqrt(dx**2 + dy**2);
		let moveMagnitudeX = dx / magnitude;
		let moveMagnitudeY = dy / magnitude;
		let velocityX = moveMagnitudeX * velocity;
		let velocityY = moveMagnitudeY * velocity;
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
		if (distanceTraveled >= this.range) {
			this.deactivate();
		}

		// Temporary: deactivate projectile when it leaves the screen
		// Later on into development need to deactivate the bread when it collides with the walls of the dungeon
		if (this.x < -this.displayWidth/2 || this.x > this.scene.physics.world.bounds.width + this.displayWidth/2 || this.y < -this.displayHeight/2 || this.y > this.scene.physics.world.bounds.height + this.displayHeight/2) {
			this.deactivate();
		}
	}
}