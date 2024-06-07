class Upgrade extends Phaser.GameObjects.Sprite
{
	// VARIABLES:

	// Text
	/** @type {Phaser.GameObjects.Text} */  upgradeText;
	/** @type {Phaser.GameObjects.Text} */  upgradeDetailsText;

	// Upgrades
	selected = false;
	upgrade = {};
	upgradeType = "";
	upgradeAmount = 0;
	totalChance = 0;
	upgrades = [
		// note: the "chance" variable acts more like a "weight" since all the chances don't need to add up to 100
		{ upgrade: "max health", chance: 10,
			minFlat: 1, maxFlat: 5, minPercent: 1.05, maxPercent: 1.25 },
		{ upgrade: "regeneration", chance: 10,
			minFlat: 0.25, maxFlat: 2, minPercent: 1.1, maxPercent: 1.75 },
		{ upgrade: "move speed", chance: 10,
			minFlat: 10, maxFlat: 50, minPercent: 1.01, maxPercent: 1.1 },
		{ upgrade: "dash cooldown", chance: 10,
			minFlat: 0.05, maxFlat: 0.2, minPercent: 0.1, maxPercent: 0.33 },
		{ upgrade: "net damage", chance: 10,
			minFlat: 1, maxFlat: 5, minPercent: 1.05, maxPercent: 1.25 },
		{ upgrade: "net range", chance: 5,
			minFlat: 5, maxFlat: 25, minPercent: 1.05, maxPercent: 1.25 },
		{ upgrade: "net knockback", chance: 5,
			minFlat: 100, maxFlat: 325, minPercent: 1.1, maxPercent: 1.5 },
		{ upgrade: "net cooldown", chance: 5,
			minFlat: 0.01, maxFlat: 0.1, minPercent: 0.1, maxPercent: 0.33 },
		{ upgrade: "net swing size", chance: 5,
			minFlat: 10, maxFlat: 50, minPercent: 1.05, maxPercent: 1.25 },
		{ upgrade: "bread damage", chance: 10,
			minFlat: 1, maxFlat: 5, minPercent: 1.05, maxPercent: 1.25 },
		{ upgrade: "bread range", chance: 10,
			minFlat: 75, maxFlat: 200, minPercent: 1.1, maxPercent: 1.25 },
		{ upgrade: "bread velocity", chance: 5,
			minFlat: 100, maxFlat: 250, minPercent: 1.1, maxPercent: 1.25 },
		{ upgrade: "bread knockback", chance: 5,
			minFlat: 15, maxFlat: 75, minPercent: 1.01, maxPercent: 1.1 },
		{ upgrade: "bread cooldown", chance: 10,
			minFlat: 0.1, maxFlat: 0.33, minPercent: 0.1, maxPercent: 0.25 },
		{ upgrade: "bread size", chance: 5,
			minFlat: 50, maxFlat: 150, minPercent: 1.25, maxPercent: 2 },
		{ upgrade: "invincibility duration", chance: 5,
			minFlat: 0.05, maxFlat: 0.2, minPercent: 1.1, maxPercent: 1.5 }
		
		// regen?
		// life steal / on hit heal?
	];



	// METHODS:

	/** @param {Phaser.Scene} scene    @param {number} x    @param {number} y */
	constructor(scene, x, y)
	{
		// Do necessary initial stuff
		super(scene, x, y, "Upgrade Frame");
		scene.add.existing(this);

		// Hide
		this.setVisible(false);

		// Create text
		this.upgradeText = scene.add.text(0, 0, "", {
			wordWrap: { width: this.displayWidth - 20 }
		});
		this.upgradeText.setOrigin(0.5, 0);
		this.upgradeText.setAlign("center");
		this.upgradeText.setFontSize(20);
		this.upgradeText.setColor("black");
		this.upgradeText.setScrollFactor(0);
		this.upgradeText.setVisible(false);

		this.upgradeDetailsText = scene.add.text(0, 0, "", {
			wordWrap: { width: this.displayWidth - 20 }
		});
		this.upgradeDetailsText.setOrigin(0.5, 0);
		this.upgradeDetailsText.setAlign("center");
		this.upgradeDetailsText.setFontSize(20);
		this.upgradeDetailsText.setColor("black");
		this.upgradeDetailsText.setScrollFactor(0);
		this.upgradeDetailsText.setVisible(false);

		// Set total chance
		for (let upgrade of this.upgrades) {
			this.totalChance += upgrade.chance;
		}

		// Set selection input
		this.setInteractive();
		this.on("pointerdown", () => {
			if (!this.selected && this.scene.numUpgradesSelected < 2) {
				this.selected = true;
				this.setTint(0xdadada);
				this.scene.numUpgradesSelected++;
				this.scene.sound.play("Button Press");
			}
			else if (this.selected && this.scene.numUpgradesSelected > 0) {
				this.selected = false;
				this.clearTint();
				this.scene.numUpgradesSelected--;
				this.scene.sound.play("Button Press");
			}
		});

		// Return instance
		return this;
	}
	
	setPosition(x, y)
	{
		super.setPosition(x, y);

		// have to do this because setPosition() is used in a sprite's constructor
		// so when the constructor for this class is called, it calls sprite's constructor which calls setPosition()
		// when that call happens, upgradeText and upgradeDetailsText won't have been set yet
		if (this.upgradeText != undefined && this.upgradeDetailsText != undefined) {
			this.upgradeText.setPosition(x, y - 75);
			this.upgradeDetailsText.setPosition(x, y);
		}
	}

	setAndShow()
	{
		// Unselect self
		this.selected = false;
		this.clearTint();

		// Randomly select an upgrade
		let randomNum = Phaser.Math.Between(1, this.totalChance);
		let upgradeCounter = 0;
		let chanceCounter = 0;
		while (chanceCounter < randomNum) {
			chanceCounter += this.upgrades[upgradeCounter].chance;
			upgradeCounter++;
		}
		this.upgrade = this.upgrades[upgradeCounter - 1];

		// Set upgrade text
		let upgradeText = this.upgrade.upgrade;
		let upgradeTextCapitalized = upgradeText.toLowerCase().split(" ").map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
		this.upgradeText.setText(upgradeTextCapitalized);

		// Randomly select a type and amount, then set upgrade details text
		if (Math.random() < 0.5)
		{
			this.upgradeType = "flat";

			if (upgradeText == "invincibility duration" || upgradeText == "regeneration") {						// special cases
				let change = Phaser.Math.FloatBetween(this.upgrade.minFlat, this.upgrade.maxFlat);
				let changeRounded = Math.round(change * 100) / 100;				// rounded to 2 decimal places
				this.upgradeAmount = changeRounded;
				this.upgradeDetailsText.setText(`Increase ${upgradeText} by ${this.upgradeAmount}`)
			}

			else if (this.upgrade.minPercent >= 1) {															// increase upgrade
				this.upgradeAmount = Phaser.Math.Between(this.upgrade.minFlat, this.upgrade.maxFlat);
				this.upgradeDetailsText.setText(`Increase ${upgradeText} by ${this.upgradeAmount}`)
			}
			else {																								// decrease upgrade
				let change = Phaser.Math.FloatBetween(this.upgrade.minFlat, this.upgrade.maxFlat);
				let changeRounded = Math.round(change * 100) / 100;				// rounded to 2 decimal places
				this.upgradeAmount = changeRounded;
				this.upgradeDetailsText.setText(`Decrease ${upgradeText} by ${this.upgradeAmount}`)
			}
		}
		else
		{
			this.upgradeType = "percent"

			let multiplier = Phaser.Math.FloatBetween(this.upgrade.minPercent, this.upgrade.maxPercent);
			let multiplierRounded = Math.round(multiplier * 100) / 100;		// rounded to 2 decimal places
			this.upgradeAmount = multiplierRounded;
			if (this.upgrade.minPercent >= 1) {		// increase upgrade
				let percentChange = Math.round((multiplierRounded - 1) * 100);
				this.upgradeDetailsText.setText(`Increase ${upgradeText} by ${percentChange}%`)
			}
			else {									// decrease upgrade
				let percentChange = Math.round(multiplierRounded * 100);
				this.upgradeDetailsText.setText(`Decrease ${upgradeText} by ${percentChange}%`)
			}
		}

		// Show
		this.setVisible(true);
		this.upgradeText.setVisible(true);
		this.upgradeDetailsText.setVisible(true);
	}

	upgradeAndHide()
	{
		// Upgrade player
		if (this.selected) {
			this.scene.player.upgrade(this.upgrade.upgrade, this.upgradeType, this.upgradeAmount);
		}

		// Hide
		this.setVisible(false);
		this.upgradeText.setVisible(false);
		this.upgradeDetailsText.setVisible(false);
	}
}