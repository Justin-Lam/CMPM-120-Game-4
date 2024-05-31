class Test extends Phaser.Scene
{
	// Game Objects
	/** @type {Player} */  player;
	/** @type {Phaser.Physics.Arcade.Group} */  enemiesGroup;

	// Colliders
	/** @type {Phaser.Physics.Arcade.Collider} */  player_Enemy_Collider;

	// Methods
	constructor()
	{
		super('testScene')
	}

	create()
	{
		// Disable context menu (thing that shows up when you right click)
		this.input.mouse.disableContextMenu();

		// Create player
		this.player = new Player(this, 100, 100);

		// Create enemies
		this.enemies = [
			new Enemy(this, 500, 100),
			new Enemy(this, 600, 200),
			new Enemy(this, 700, 300),
			new Enemy(this, 800, 400),
			new Enemy(this, 900, 500)
		];
		this.enemiesGroup = this.physics.add.group(this.enemies);

		// Create collision handlers
		this.player_Enemy_Collider = this.physics.add.collider(this.player, this.enemiesGroup);
		this.physics.add.overlap(this.player.netSwipe, this.enemiesGroup, this.netSwipe_Enemy_Collision, null, this);
		this.physics.add.overlap(this.player.breadGroup, this.enemiesGroup, this.bread_Enemy_Collision, null, this);
	}

	update(time, delta)
	{
		this.player.update(delta);
		for (let enemy of this.enemiesGroup.getChildren()) {
			enemy.update(delta);
		}
	}

	/** @param {Phaser.Physics.Arcade.Sprite} swipe    @param {Enemy} enemy */
	netSwipe_Enemy_Collision(swipe, enemy)
	{
		if (swipe.visible) {
			if (enemy.invulnerableToNetDurationCounter <= 0.0)
			{
				enemy.getHitByNet(this.player.NET_DAMAGE);
			}
		}
	}

	/** @param {Phaser.Physics.Arcade.Sprite} bread    @param {Enemy} enemy */
	bread_Enemy_Collision(bread, enemy)
	{
		if (bread.visible) {
			bread.deactivate();
			enemy.takeDamage(this.player.GUN_DAMAGE);
		}
	}
}