class DungeonFunctionalityTest extends Phaser.Scene
{
	// VARIABLES:

	// Level
	level = 1;
	numEnemies = 0;
	screen = "dungeon";
	ENEMIES_PER_LEVEL = 2;
	MIN_ENEMY_SPAWN_DIST_FROM_PLAYER = 300;

	// World
	WORLD_BOUNDS_X = 1920;
	WORLD_BOUNDS_Y = 1080;

	// Upgrades
	upgrades = [];
	numUpgradesSelected = 0;
	NUM_UPGRADES = 5;
	UPGRADE_HORIZONTAL_SPACING = 15;
	UPGRADE_VERTICAL_SPACING = 15;

	// Text
	/** @type {Phaser.GameObjects.Text} */  levelText;
	/** @type {Phaser.GameObjects.Text} */  playerHealthText;
	/** @type {Phaser.GameObjects.Text} */  enemiesRemainingText;
	/** @type {Phaser.GameObjects.Text} */  levelCompleteText;
	/** @type {Phaser.GameObjects.Text} */  selectUpgradesText;
	/** @type {Phaser.GameObjects.Text} */  nextLevelText;
	/** @type {Phaser.GameObjects.Text} */  deathText;
	/** @type {Phaser.GameObjects.Text} */  restartText;

	// Player
	/** @type {Player} */  player;
	playerDashDisableColliders = [];

	// Groups
	/** @type {Phaser.Physics.Arcade.Group} */  enemyAttackGroup;
	/** @type {Phaser.Physics.Arcade.Group} */  enemy2PoopGroup;
	/** @type {Phaser.Physics.Arcade.Group} */  enemyGroup;


	
	// METHODS:
	constructor()
	{
		super('dungeonFunctionalityTestScene')
	}

	create()
	{
		// Disable context menu (thing that shows up when you right click)
		this.input.mouse.disableContextMenu();

		// Set world
		this.physics.world.setBounds(0,0, this.WORLD_BOUNDS_X, this.WORLD_BOUNDS_Y);

		// Create player
		this.player = new Player(this, 0, 0);

		// Create groups
		this.createGroups();

		// Create collision handlers
		this.createCollisionHandlers();

		// Create upgrades
		this.createUpgrades();

		// Create text
		this.createText();

		// Set Camera
		this.setCamera();

		// Start first level
		this.startLevel();

		// Temporary keys
		this.input.keyboard.on('keydown-T', () => {		// next level
			if (this.screen == "victory") {
				this.levelCompleteText.setVisible(false);
				this.selectUpgradesText.setVisible(false);
				for (let upgrade of this.upgrades) {
					upgrade.setAndShow();
				}
				this.nextLevelText.setVisible(true);
				this.screen = "upgrade";
			}
			else if (this.screen == "upgrade") {
				for (let upgrade of this.upgrades) {
					upgrade.upgradeAndHide();
				}
				this.numUpgradesSelected = 0;
				this.startLevel();
			}
			else if (this.screen == "death") {
				this.scene.restart();
			}
		});
		this.input.keyboard.on('keydown-F', () => {			// debug
			for (let i = this.enemyGroup.getLength() - 1; i >= 0; i--) {
				this.enemyGroup.getChildren()[i].takeDamage(999);
			}
		});
	}
	createGroups()
	{
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
		this.enemyGroup = this.physics.add.group({
			collideWorldBounds: true
		});
	}
	createCollisionHandlers()
	{
		this.playerDashDisableColliders.push(this.physics.add.collider(this.player, this.enemyGroup, this.player_Enemy_Collision, null, this));
		this.playerDashDisableColliders.push(this.physics.add.overlap(this.player, this.enemyAttackGroup, this.enemyAttack_Player_Collision, null, this));
		this.physics.add.collider(this.enemyGroup, this.enemyGroup);
		this.physics.add.overlap(this.player.netSwipe, this.enemyGroup, this.netSwipe_Enemy_Collision, null, this);
		this.physics.add.overlap(this.player.breadGroup, this.enemyGroup, this.bread_Enemy_Collision, null, this);
	}
	createUpgrades()
	{
		
		for (let i = 0; i < this.NUM_UPGRADES; i++)
		{
			// Create upgrade
			let upgrade = new Upgrade(this, 0, 0);

			// Add upgrade to list
			this.upgrades.push(upgrade);

			// Set upgrade position
			let topRowNumUpgrades = Math.ceil((this.NUM_UPGRADES)/2);
			let horizontalSideBuffer = (game.config.width - (topRowNumUpgrades * upgrade.displayWidth + (topRowNumUpgrades-1) * this.UPGRADE_HORIZONTAL_SPACING)) / 2;
			let verticalSideBuffer = (game.config.height - (2 * upgrade.displayHeight + this.UPGRADE_VERTICAL_SPACING)) / 2;
			if ((i + 1) % 2 != 0) {		// upgrade elem number is odd
				upgrade.setPosition(
					horizontalSideBuffer + upgrade.displayWidth/2 + ((i/2) * (upgrade.displayWidth + this.UPGRADE_HORIZONTAL_SPACING)),
					verticalSideBuffer + upgrade.displayHeight/2
				);
			}
			else {						// upgrade elem number is even
				upgrade.setPosition(
					horizontalSideBuffer + upgrade.displayWidth + this.UPGRADE_HORIZONTAL_SPACING/2 + (((i-1)/2) * (upgrade.displayWidth + this.UPGRADE_HORIZONTAL_SPACING)),
					verticalSideBuffer + upgrade.displayHeight * 1.5 + this.UPGRADE_VERTICAL_SPACING
				);
			}

			// Set scroll factor
			upgrade.setScrollFactor(0);
		}
	}
	createText()
	{
		this.levelText = this.add.text(10, 10, "Level: " + this.level);
		this.levelText.setFontSize(30);
		this.levelText.setScrollFactor(0);
		this.playerHealthText = this.add.text(game.config.width-250, 10, `Health: ${this.player.health}/${this.player.MAX_HEALTH}`);
		this.playerHealthText.setFontSize(30);
		this.playerHealthText.setScrollFactor(0);
		this.enemiesRemainingText = this.add.text(10, 50, "Enemies Remaining: " + this.numEnemies);
		this.enemiesRemainingText.setFontSize(30);
		this.enemiesRemainingText.setScrollFactor(0);
		this.levelCompleteText = this.add.text(game.config.width/2, game.config.height/2 - 25, "Level Complete!");
		this.levelCompleteText.setOrigin(0.5);
		this.levelCompleteText.setAlign("center");
		this.levelCompleteText.setFontSize(60);
		this.levelCompleteText.setScrollFactor(0);
		this.selectUpgradesText = this.add.text(game.config.width/2, game.config.height/2 + 25, "(Press T to select upgrades)");
		this.selectUpgradesText.setOrigin(0.5);
		this.selectUpgradesText.setAlign("center");
		this.selectUpgradesText.setFontSize(20);
		this.selectUpgradesText.setScrollFactor(0);
		this.nextLevelText = this.add.text(game.config.width/2, game.config.height/2 + 285, "(Press T to begin next level)");
		this.nextLevelText.setOrigin(0.5);
		this.nextLevelText.setAlign("center");
		this.nextLevelText.setFontSize(20);
		this.nextLevelText.setScrollFactor(0);
		this.deathText = this.add.text(game.config.width/2, game.config.height/2 - 25, "You Died!")
			.setOrigin(0.5)
			.setAlign("center")
			.setFontSize(60)
			.setScrollFactor(0);
		this.restartText = this.add.text(game.config.width/2, game.config.height/2 + 25, "(Press T to restart)")
			.setOrigin(0.5)
			.setAlign("center")
			.setFontSize(20)
			.setScrollFactor(0);
	}
	setCamera()
	{
		this.cameras.main.setBounds(0, 0, this.WORLD_BOUNDS_X, this.WORLD_BOUNDS_Y);
		this.cameras.main.startFollow(this.player, true, 0.25, 0.25);
		this.cameras.main.setDeadzone(50, 50);
		this.cameras.main.setZoom(1);
	}
	

	startLevel()
	{
		// Spawn player in a random place
		let playerSpawnX = Phaser.Math.Between(0 + this.player.displayWidth/2, this.physics.world.bounds.width - this.player.displayWidth/2);
		let playerSpawnY = Phaser.Math.Between(0 + this.player.displayHeight/2, this.physics.world.bounds.height - this.player.displayHeight/2);
		this.player.setPosition(playerSpawnX, playerSpawnY);

		// Spawn enemies
		// amount of enemies spawned is equal to the value of the level
		for (let i = 0; i < this.level * this.ENEMIES_PER_LEVEL - 1; i++)
		{
			// Randomly choose an enemy type
			let enemyType = Phaser.Math.Between(1, 3);

			// Create enemy
			let enemy = null;
			if (enemyType == 1) {
				enemy = new Enemy1(this, 0, 0);
			}
			else if (enemyType == 2) {
				enemy = new Enemy2(this, 0, 0);
			}
			else {
				enemy = new Enemy3(this, 0, 0);
			}

			// Add enemy to enemyGroup
			this.enemyGroup.add(enemy);

			// Spawn enemy in a random place that's not too close to the player
			let enemySpawnX = 0;
			let enemySpawnY = 0;
			let enemySpawnDistFromPlayer = 0;
			while (enemySpawnDistFromPlayer <= this.MIN_ENEMY_SPAWN_DIST_FROM_PLAYER) {
				enemySpawnX = Phaser.Math.Between(0 + enemy.displayWidth/2, this.physics.world.bounds.width - enemy.displayWidth/2);
				enemySpawnY = Phaser.Math.Between(0 + enemy.displayHeight/2, this.physics.world.bounds.height - enemy.displayHeight/2);
				let dx = enemySpawnX - playerSpawnX;
				let dy = enemySpawnY - playerSpawnY;
				enemySpawnDistFromPlayer = Math.sqrt(dx**2 + dy**2);
			}
			enemy.setPosition(enemySpawnX, enemySpawnY);

			// Increment num enemies
			this.numEnemies++;
		}

		// Set texts
		this.levelText.setText("Level: " + this.level);
		this.playerHealthText.setText(`Health: ${this.player.health}/${this.player.MAX_HEALTH}`);
		this.enemiesRemainingText.setText("Enemies Remaining: " + this.numEnemies);
		this.levelCompleteText.setVisible(false);
		this.selectUpgradesText.setVisible(false);
		this.nextLevelText.setVisible(false);
		this.deathText.setVisible(false);
		this.restartText.setVisible(false);

		// Set screen
		this.screen = "dungeon";
	}

	onPlayerDamaged()
	{
		// Update player health text
		this.playerHealthText.setText(`Health: ${this.player.health}/${this.player.MAX_HEALTH}`);
	}

	onPlayerDeath()
	{
		// Show death texts
		this.deathText.setVisible(true);
		this.restartText.setVisible(true);

		// Set screen
		this.screen = "death";
	}

	onEnemyDeath()
	{
		// Decrement num enemies
		this.numEnemies--;

		// Set enemies remaining text
		this.enemiesRemainingText.setText("Enemies Remaining: " + this.numEnemies);

		// Check if all enemies have died
		if (this.numEnemies <= 0)
		{
			// Show level complete texts
			this.levelCompleteText.setVisible(true);
			this.selectUpgradesText.setVisible(true);

			// Set screen
			this.screen = "victory";

			// Increment level
			this.level++;
		}
	}

	update(time, delta)
	{
		// Update game objects
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