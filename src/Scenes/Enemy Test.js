class EnemyTest extends Phaser.Scene
{
	// VARIABLES:

	// Game Objects
	/** @type {Player} */  player;
	/** @type {Phaser.Physics.Arcade.Group} */  enemyAttackGroup;
	/** @type {Phaser.Physics.Arcade.Group} */  enemy2PoopGroup;
	/** @type {Phaser.Physics.Arcade.Group} */  enemyGroup;

	// Colliders
	playerDashDisableColliders = [];


	
	// METHODS:
	constructor()
	{
		super('enemyTestScene')
	}

	create()
	{
		// Disable context menu (thing that shows up when you right click)
		this.input.mouse.disableContextMenu();

		// Set world
        this.physics.world.setBounds(0,0, 1920*2, 1080*2);

		// Create player
		this.player = new Player(this, 100, this.physics.world.bounds.height/2);

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
		this.enemyGroup.add(new Enemy3(this, this.player.x + 1200, this.player.y));

		// Create collision handlers
		this.playerDashDisableColliders.push(this.physics.add.collider(this.player, this.enemyGroup, this.player_Enemy_Collision, null, this));
		this.physics.add.overlap(this.player.netSwipe, this.enemyGroup, this.netSwipe_Enemy_Collision, null, this);
		this.physics.add.overlap(this.player.breadGroup, this.enemyGroup, this.bread_Enemy_Collision, null, this);
		this.physics.add.collider(this.enemyGroup, this.enemyGroup);
		this.playerDashDisableColliders.push(this.physics.add.overlap(this.player, this.enemyAttackGroup, this.enemyAttack_Player_Collision, null, this));

		// Handle camera
		this.cameras.main.setBounds(0, 0, 1920*2, 1080*2);
        this.cameras.main.startFollow(this.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(1);

		// debug key listener (assigned to D key)
		this.input.keyboard.on('keydown-F', () => {
			if (this.cameras.main.zoom == 1) {
				this.cameras.main.setZoom(0.5);
			}
			else {
				this.cameras.main.setZoom(1);
			}
		});
	}

	update(time, delta)
	{
		this.player.update(delta);

		for (let enemy of this.enemyGroup.getChildren()) {
			enemy.update(delta);
		}
	}

	/** @param {Player} player    @param {Enemy} enemy */
	player_Enemy_Collision(player, enemy)
	{
		if (enemy instanceof Enemy3) {
			if (enemy.chargeDurationCounter <= 0) {
				return;
			}
			player.getHitByCharge(enemy);
		}
	}

	/** @param {Phaser.Physics.Arcade.Sprite} swipe    @param {Enemy} enemy */
	netSwipe_Enemy_Collision(swipe, enemy)
	{
		if (swipe.visible) {
			enemy.getHitByAttack(swipe, "net");
		}
	}

	/** @param {Phaser.Physics.Arcade.Sprite} bread    @param {Enemy} enemy */
	bread_Enemy_Collision(bread, enemy)
	{
		if (bread.visible) {
			bread.deactivate();
			enemy.getHitByAttack(bread, "bread");
		}
	}

	/** @param {Player} player    @param {Phaser.Physics.Arcade.Sprite} attack */
	enemyAttack_Player_Collision(player, attack)
	{
		if (attack.visible) {
			player.getHitByAttack(attack);
		}
	}
}