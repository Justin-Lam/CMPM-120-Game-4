class UltrabirdFight extends Phaser.Scene
{
	// VARIABLES:

	// Scene
	screen = "fight";

	// World
	WORLD_BOUND_LENGTH;

	// Map
	/** @type {MapGen} */  mapgen;

	// Ultrabird
	/** @type {Ultrabird} */  ultrabird;
	/** @type {Phaser.Physics.Arcade.Group} */  ultrabirdAttackGroup;
	/** @type {Phaser.Physics.Arcade.Group} */  ultrabirdProjectileGroup;

	// Player
	/** @type {Player} */  prevPlayer;
	/** @type {Player} */  player;
	playerDashDisableColliders = [];

	// Text
	/** @type {Phaser.GameObjects.Text} */  ultrabirdHealthText;
	/** @type {Phaser.GameObjects.Text} */  playerHealthText;
	/** @type {Phaser.GameObjects.Text} */  ultrabirdCapturedText;
	/** @type {Phaser.GameObjects.Text} */  tagAndReleaseText;
	/** @type {Phaser.GameObjects.Text} */  deathText;
	/** @type {Phaser.GameObjects.Text} */  restartText;



	// METHODS:

	constructor() {
		super("ultrabirdFightScene");
	}

	init(data)
	{
		// Set variables
		this.WORLD_BOUND_LENGTH = 1500;
		
		// Use data
		this.prevPlayer = data.player;
	}

	create()
	{
		// Disable context menu (thing that shows up when you right click)
		this.input.mouse.disableContextMenu();

		// Set input
		this.input.keyboard.on('keydown-T', () => {
			if (this.screen == "victory") {
				
			}
			else if (this.screen == "death") {
				this.sound.play("Dungeon Screen Change");
				this.scene.start("labScene");
			}
		});
		
		// Set world
		this.physics.world.setBounds(0,0, this.WORLD_BOUND_LENGTH, this.WORLD_BOUND_LENGTH);

		// Create map
		this.mapgen = new MapGen(this);
		this.mapgen.mapWidth = Math.ceil(this.WORLD_BOUND_LENGTH/16) + 10;
		this.mapgen.mapHeight = Math.ceil(this.WORLD_BOUND_LENGTH/16) + 10;
		this.mapgen.create();

		// Create ultrabird
		this.ultrabird = new Ultrabird(this, this.WORLD_BOUND_LENGTH/2, this.WORLD_BOUND_LENGTH/2);
		this.createGroups();

		// Create player
		//this.player = new Player(this, this.WORLD_BOUND_LENGTH/2, this.WORLD_BOUND_LENGTH - 100)
		//	.copy(this.prevPlayer);
		this.player = new Player(this, this.WORLD_BOUND_LENGTH/2, this.WORLD_BOUND_LENGTH - 100);
		
		// Create collision handlers
		this.createCollisionHandlers();

		// Create text
		this.createText();

		// Set camera
		this.setCamera();


		this.input.keyboard.on('keydown-F', () => {			// debug
			console.log(this.ultrabird.x, this.ultrabird.y);
			console.log(this.player.x, this.player.y);
		});
	}
	createGroups()
	{
		this.ultrabirdAttackGroup = this.physics.add.group();
		this.ultrabirdProjectileGroup = this.physics.add.group({
			maxSize: 50,
			runChildUpdate: true
		});
		let ultrabirdProjectiles = this.ultrabirdProjectileGroup.createMultiple({
			classType: Projectile,
			setXY: {x: -100, y: -100},
			key: "Enemy Poop",
			frame: 0,
			repeat: this.ultrabirdProjectileGroup.maxSize-1,
			active: false,
			visible: false
		});
		for (let projectile of ultrabirdProjectiles) {
			this.ultrabirdAttackGroup.add(projectile);
		}
	}
	createCollisionHandlers()
	{
		this.playerDashDisableColliders.push(this.physics.add.collider(this.player, this.ultrabird, this.player_Ultrabird_Collision, null, this));
		this.playerDashDisableColliders.push(this.physics.add.overlap(this.player, this.ultrabirdAttackGroup, this.player_UltrabirdAttack_Overlap, null, this));
		this.physics.add.overlap(this.ultrabird, this.player.netSwipe, this.ultrabird_PlayerNetSwipe_Overlap, null, this);
		this.physics.add.overlap(this.ultrabird, this.player.breadGroup, this.ultrabird_PlayerBread_Overlap, null, this);
	}
	createText()
	{
		this.ultrabirdHealthText = this.add.text(game.config.width/2, 50, `Ultrabird Health:\n${this.ultrabird.health}/${this.ultrabird.MAX_HEALTH}`)
			.setOrigin(0.5)
			.setAlign("center")
			.setFontSize(40)
			.setScrollFactor(0)
			.setVisible(false);
		this.playerHealthText = this.add.text(game.config.width-250, 10, `Health: ${Math.ceil(this.player.health)}/${this.player.MAX_HEALTH}`)
			.setFontSize(30)
			.setScrollFactor(0);
		this.ultrabirdCapturedText = this.add.text(game.config.width/2, game.config.height/2 - 25, "ULTRABIRD CAPTURED!!!")
			.setOrigin(0.5)
			.setAlign("center")
			.setFontSize(60)
			.setScrollFactor(0)
			.setVisible(false);
		this.tagAndReleaseText = this.add.text(game.config.width/2, game.config.height/2 + 25, "(Press T to tag and release)")
			.setOrigin(0.5)
			.setAlign("center")
			.setFontSize(20)
			.setScrollFactor(0)
			.setVisible(false);
		this.deathText = this.add.text(game.config.width/2, game.config.height/2 - 25, "You Died!")
			.setOrigin(0.5)
			.setAlign("center")
			.setFontSize(60)
			.setScrollFactor(0)
			.setVisible(false);
		this.restartText = this.add.text(game.config.width/2, game.config.height/2 + 25, "(Press T to restart)")
			.setOrigin(0.5)
			.setAlign("center")
			.setFontSize(20)
			.setScrollFactor(0)
			.setVisible(false);
	}
	setCamera()
	{
		this.cameras.main.setBounds(0, 0, this.WORLD_BOUND_LENGTH, this.WORLD_BOUND_LENGTH);
		this.cameras.main.startFollow(this.player, true, 0.25, 0.25);
		this.cameras.main.setDeadzone(50, 50);
		this.cameras.main.setZoom(1);
	}

	update(time, delta)
	{
		this.player.update(delta);
		this.ultrabird.update(delta);
	}

	/** @param {Player} player    @param {Ultrabird} ultrabird */
	player_Ultrabird_Collision(player, ultrabird)
	{
		if (!ultrabird.visible) {
			this.ultrabird.onDiscovered();
			this.player.getKnockedBackByCharge({
				x: this.ultrabird.x,
				y: this.ultrabird.y,
				CHARGE_KNOCKBACK_VELOCITY: 1000,
				CHARGE_KNOCKBACK_DURATION: this.ultrabird.INACTIVE_DURATION
			});
			this.cameras.main.shake(1*1000, 0.015);
		}
		else {

		}
	}
	layer_UltrabirdAttack_Overlap()
	{

	}
	ultrabird_PlayerNetSwipe_Overlap()
	{

	}
	ultrabird_PlayerBread_Overlap()
	{
		
	}
}