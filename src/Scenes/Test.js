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

		// Add map
		this.map = this.add.tilemap("basic-level-alt", 16, 16, 50, 20);
        this.physics.world.setBounds(0,0, 50*16*SCALE, 20*16*SCALE);

		// Add tilesets to the map
        this.tilesetList = [
            this.map.addTilesetImage("urban_tilemap_packed_bigger", "urban_tiles"), 
			this.map.addTilesetImage("roguelikeSheet_transparent", "rpg_tiles"), 
			this.map.addTilesetImage("shmup_tiles_packed", "shmup_tiles"), 
			this.map.addTilesetImage("town_tilemap_packed", "town_tiles") 
        ];

		// Create map layers
        this.floorLayer = this.map.createLayer("Flooring", this.tilesetList);
        this.floorLayer.setScale(SCALE);

        this.waterLayer = this.map.createLayer("Water", this.tilesetList);
        this.waterLayer.setScale(SCALE);

		this.floorDecorLayer = this.map.createLayer("Floor-decor", this.tilesetList);
        this.floorDecorLayer.setScale(SCALE);

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
		this.enemyGroup.add(new Enemy1(this, 900, 200));
		this.enemyGroup.add(new Enemy2(this, 900, 400));
		this.enemyGroup.add(new Enemy1(this, 900, 600));

		// Creating layers that appear above player
		this.treeLayer1 = this.map.createLayer("Trees-collide", this.tilesetList);
        this.treeLayer1.setScale(SCALE);

		this.treeLayer2 = this.map.createLayer("Trees-nocollide", this.tilesetList);
        this.treeLayer2.setScale(SCALE);

		this.treeBorderLayer = this.map.createLayer("Tree-borders", this.tilesetList);
        this.treeBorderLayer.setScale(SCALE);
		this.treeBorderLayer.setTint(0x669090);

		this.treeBorderDetailsLayer = this.map.createLayer("Tree-border-details", this.tilesetList);
        this.treeBorderDetailsLayer.setScale(SCALE);
		this.treeBorderDetailsLayer.setTint(0x8ebfac);

		this.treeBorderEdgesLayer = this.map.createLayer("Tree-border-edges", this.tilesetList);
        this.treeBorderEdgesLayer.setScale(SCALE);
		this.treeBorderEdgesLayer.setTint(0x669070);
		this.treeBorderEdgesLayer.setAlpha(0.75);

		// Create collision handlers
		this.treeLayer1.setCollisionByExclusion([-1], true);
		this.treeBorderLayer.setCollisionByExclusion([-1], true);
		this.treeBorderDetailsLayer.setCollisionByExclusion([-1], true); 

		this.physics.add.collider(this.player, this.treeLayer1);
		this.physics.add.collider(this.player, this.treeBorderLayer);
		this.physics.add.collider(this.player, this.treeBorderDetailsLayer); // player collision with map

		this.physics.add.collider(this.enemyGroup, this.treeLayer1);
		this.physics.add.collider(this.enemyGroup, this.treeBorderLayer);
		this.physics.add.collider(this.enemyGroup, this.treeBorderDetailsLayer); // enemy collision with map

		this.playerDashDisableColliders.push(this.physics.add.collider(this.player, this.enemyGroup));
		this.physics.add.overlap(this.player.netSwipe, this.enemyGroup, this.netSwipe_Enemy_Collision, null, this);
		this.physics.add.overlap(this.player.breadGroup, this.enemyGroup, this.bread_Enemy_Collision, null, this);
		this.physics.add.collider(this.enemyGroup, this.enemyGroup);
		this.playerDashDisableColliders.push(this.physics.add.overlap(this.player, this.enemyAttackGroup, this.enemyAttack_Player_Collision, null, this));

		// Handle camera
		this.cameras.main.setBounds(0, 0, this.map.widthInPixels * SCALE, this.map.heightInPixels * SCALE);
        this.cameras.main.startFollow(this.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

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
				player.getHitByAttack(attack);
			}
		}
	}
}