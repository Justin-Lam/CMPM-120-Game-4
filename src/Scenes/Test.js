class Test extends Phaser.Scene
{
	// Game Objects
	/** @type {Player} */  player;
	/** @type {Phaser.Physics.Arcade.Group} */  enemyAttackGroup;
	/** @type {Phaser.Physics.Arcade.Group} */  enemy2PoopGroup;
	/** @type {Phaser.Physics.Arcade.Group} */  enemyGroup;

	// Colliders
	playerDashDisableColliders = [];

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
		this.enemyAttackGroup = this.physics.add.group();
		this.enemy2PoopGroup = this.physics.add.group({
			maxSize: 50,
			runChildUpdate: true
		});
		let enemyPoops = this.enemy2PoopGroup.createMultiple({
			classType: Projectile,
			setXY: {x: -100, y: -100},
			key: "Enemy Poop",
			frame: 0,
			repeat: this.enemy2PoopGroup.maxSize-1,
			active: false,
			visible: false
		});
		for (let poop of enemyPoops) {
			this.enemyAttackGroup.add(poop);
		}
		this.enemyGroup = this.physics.add.group();
		this.enemyGroup.add(new Enemy2(this, 900, 300));

		// Create collision handlers
		this.playerDashDisableColliders.push(this.physics.add.collider(this.player, this.enemyGroup));
		this.physics.add.overlap(this.player.netSwipe, this.enemyGroup, this.netSwipe_Enemy_Collision, null, this);
		this.physics.add.overlap(this.player.breadGroup, this.enemyGroup, this.bread_Enemy_Collision, null, this);
		this.physics.add.collider(this.enemyGroup, this.enemyGroup);
		this.playerDashDisableColliders.push(this.physics.add.overlap(this.player, this.enemyAttackGroup, this.enemyAttack_Player_Collision, null, this));

		// debug key listener (assigned to D key)
		this.input.keyboard.on('keydown-F', () => {
			console.log("debug message");
		});
	}

	update(time, delta)
	{
		this.player.update(delta);

		for (let enemy of this.enemyGroup.getChildren()) {
			enemy.update(delta);
		}
	}

	/** @param {Phaser.Physics.Arcade.Sprite} swipe    @param {Enemy} enemy */
	netSwipe_Enemy_Collision(swipe, enemy)
	{
		if (swipe.visible) {
			if (enemy.invulnerableToNetDurationCounter <= 0.0) {
				enemy.getHitByAttack(swipe);
			}
		}
	}

	/** @param {Phaser.Physics.Arcade.Sprite} bread    @param {Enemy} enemy */
	bread_Enemy_Collision(bread, enemy)
	{
		if (bread.visible) {
			bread.deactivate();
			enemy.getHitByAttack(bread);
		}
	}

	/** @param {Player} player    @param {Phaser.Physics.Arcade.Sprite} attack */
	enemyAttack_Player_Collision(player, attack)
	{
		if (attack.visible) {
			if (player.invincibilityDurationCounter <= 0.0) {
				attack.deactivate();
				player.getHitByAttack(attack);
			}
		}
	}
}