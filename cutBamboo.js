/**Cut Bamboo For 2
 * 
 * @author Danilo Znamerovszkij
 * @description a game for 2 players
 */

// Initialasing the main variables 
var GAME_START = false;
var GAME_OVER = false;

//game rules
$('#rules').html("<span>For left player: <b>←A  S→ </b>For right player: <b>←J  K→ </b></span>");

// Set the relative dimensions
const width = 2496;
const height = 1775;

// Phaser
var game = new Phaser.Game(width, height, Phaser.AUTO, 'cutbamboo');
game.transparent = true;

// Declaration of 'main' and 'load' states
var gameState = {};
gameState.load = function() {};
gameState.main = function() {};

// Load all the resources
gameState.load.prototype = {
    preload: function() {
        // bg
        game.load.image('background', 'img/background.png');
        // characters with json files with the frames info
        game.load.atlas('samuraiRat', 'img/rat.png', 'data/character.json');
        game.load.atlas('farmer', 'img/farmer.png', 'data/character.json');
        // Bamboo
        game.load.image('trunk1', 'img/trunk1.png');
        game.load.image('trunk2', 'img/trunk2.png');
        game.load.image('branchLeft', 'img/branch1.png');
        game.load.image('branchRight', 'img/branch2.png');
        game.load.image('stump', 'img/stump.png');
        //second bamboo
        game.load.image('strunk1', 'img/trunk1.png');
        game.load.image('strunk2', 'img/trunk2.png');
        game.load.image('sbranchLeft', 'img/branch1.png');
        game.load.image('sbranchRight', 'img/branch2-2.png');
        game.load.image('sstump', 'img/stump.png');
        // numbers
        game.load.atlas('numbers', 'img/numbers.png', 'data/numbers.json');
        // time bar
        game.load.image('timeContainer', 'img/time-container.png');
        game.load.image('timeBar', 'img/time-bar.png');
        // congrat images
        game.load.atlas('levelNumbers', 'img/levelNumbers.png', 'data/numbers.json');
        game.load.image('victory', 'img/victory.png');
        //image for draw
        game.load.image('draw', 'img/draw.png');
        // image for rip
        game.load.image('rip', 'img/rip.png');

    },

    create: function() {
        game.state.start('main');
    }
};

// main state
gameState.main.prototype = {
    create: function() {
        // physics from Phaser
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // scaling of the game
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.setShowAll();
        window.addEventListener('resize', function() {
            game.scale.refresh();
        });
        game.scale.refresh();

        // Make the canvas
        this.background = game.add.sprite(0, 0, 'background');
        this.background.width = game.width;
        this.background.height = game.height;

        // ---- bamboos
        // first bamboo
        this.stump = game.add.sprite(0, 0, 'stump');
        this.stump.x = 352;
        this.stump.y = 1394;
        //second bamboo
        this.sstump = game.add.sprite(0, 0, 'sstump');
        this.sstump.x = 1720;
        this.sstump.y = 1394;
        // construction of the trunks
        this.HEIGHT_TRUNK = 243;
        this.constructTree();
        //variable indicating if the tree can be cut by a character
        this.canCut = true;

        // ---- Characters
        // The rat
        this.samuraiRat = game.add.sprite(0, 1070, 'samuraiRat');

        this.samuraiRat.animations.add('breath', [0, 1]);

        this.samuraiRat.animations.add('cut', [1, 2, 3, 4]);

        this.samuraiRat.animations.play('breath', 3, true);

        this.samuraiRatPosition = 'left';

        // The regular farmer
        this.farmer = game.add.sprite(1300, 1070, 'farmer');

        this.farmer.animations.add('breath', [0, 1]);

        this.farmer.animations.add('cut', [1, 2, 3, 4]);

        this.farmer.animations.play('breath', 3, true);

        this.farmerPosition = 'sleft';

        // Onclick add "listener()"
        game.input.onDown.add(this.listener, this);

        //  SCORE OF EVERYONE
        this.currentScore = 0;
        ///add the initial score
        var spriteScoreNumber = game.add.sprite(game.width / 2, 440, 'numbers');
        spriteScoreNumber.x -= spriteScoreNumber.width / 2;
        this.spritesScoreNumbers = new Array();
        this.spritesScoreNumbers.push(spriteScoreNumber);

        // farmer score
        this.scurrentScore = 0;
        var sspriteScoreNumber = game.add.sprite(game.width / 2, 440, 'numbers');
        sspriteScoreNumber.animations.add('number');
        sspriteScoreNumber.animations.frame = this.scurrentScore;
        sspriteScoreNumber.x -= sspriteScoreNumber.width / 2;
        this.sspritesScoreNumbers = new Array();
        this.sspritesScoreNumbers.push(spriteScoreNumber);

        // Time bars
        // Container
        this.timeContainer = game.add.sprite(0, 100, 'timeContainer');
        // place in center
        this.timeContainer.x = game.width / 2 - this.timeContainer.width / 2;
        // the bar
        this.timeBar = game.add.sprite(0, 130, 'timeBar');
        // place in center
        this.timeBar.x = game.width / 2 - this.timeBar.width / 2;
        this.timeBarWidth = this.timeBar.width;
        //cut it a but when the time passes
        var cropRect = new Phaser.Rectangle(0, 0, this.timeBarWidth, this.timeBar.height);
        this.timeBar.crop(cropRect);
        this.timeBar.updateCrop();

        // victory or draw title
        var levelPosY = 290;
        this.intituleLevel = game.add.sprite(0, levelPosY, 'victory');
        this.draw = game.add.sprite(0, levelPosY, 'draw');
        this.draw.alpha = 0;
        this.intituleLevel.alpha = 0;
        // Sprite numbers
        var spriteLevelNumber = game.add.sprite(0, levelPosY, 'levelNumbers');
        spriteLevelNumber.alpha = 0;
        spriteLevelNumber.animations.add('number');
        spriteLevelNumber.animations.frame = this.currentLevel;
        this.spritesLevelNumbers = new Array();
        this.spritesLevelNumbers.push(spriteLevelNumber);

    },

    update: function() {
        if (GAME_START) {
            if (this.timeBarWidth > 0) {
                this.timeBarWidth -= (1); //approx 15s, 0.4 = 30s
                var cropRect = new Phaser.Rectangle(0, 0, this.timeBarWidth, this.timeBar.height);
                this.timeBar.crop(cropRect);
                this.timeBar.updateCrop();
            } else {
                //timer goes off
                //both die
                this.death("1", "1");
            }
        }
        // if game is not over yet
        if (!GAME_OVER) {
            // Detect the keys
            if (game.input.keyboard.justPressed(Phaser.Keyboard.A))
                this.listener('left');
            else if (game.input.keyboard.justPressed(Phaser.Keyboard.S)) {
                this.listener('right');
            }
            //define second left and second right
            if (game.input.keyboard.justPressed(Phaser.Keyboard.J))
                this.listener('sleft');
            else if (game.input.keyboard.justPressed(Phaser.Keyboard.K)) {
                this.listener('sright');
            }
        }
    },

    listener: function(action) {

        if (this.canCut) {

            // The first init
            if (!GAME_START) {
                GAME_START = true;
            }

            var isClick = action instanceof Phaser.Pointer;

            //actions for rat
            if (action == 'left') {
                this.samuraiRat.anchor.setTo(0, 0);
                this.samuraiRat.scale.x = 1;
                this.samuraiRat.x = 0;
                this.samuraiRatPosition = 'left';
                //breathe animation
                this.samuraiRat.animations.stop('breath', true);
                //3 images per sec
                var animationCut = this.samuraiRat.animations.play('cut', 15);

                animationCut.onComplete.add(function() {
                    this.samuraiRat.animations.play('breath', 3, true);
                }, this);

                var nameTrunkToCut = this.tree.getAt(0).key;

                var nameTrunkJustAfter = this.tree.getAt(1).key;
            } else if (action == 'right') {

                this.samuraiRat.anchor.setTo(1, 0);
                this.samuraiRat.scale.x = -1;
                //place the rat on the right side of the tree
                this.samuraiRat.x = this.samuraiRat.width * -1.1;

                this.samuraiRatPosition = 'right';


                this.samuraiRat.animations.stop('breath', true);
                var animationCut = this.samuraiRat.animations.play('cut', 15);
                animationCut.onComplete.add(function() {
                    this.samuraiRat.animations.play('breath', 3, true);
                }, this);
                var nameTrunkToCut = this.tree.getAt(0).key;
                var nameTrunkJustAfter = this.tree.getAt(1).key;
            }
            //second character positions //actions for farmer
            if (action == 'sleft') {
                this.farmer.anchor.setTo(0, 0);
                this.farmer.scale.x = 1;
                this.farmer.x = 1300;
                this.farmerPosition = 'sleft';

                //animation
                this.farmer.animations.stop('breath', true);
                var sanimationCut = this.farmer.animations.play('cut', 15);
                sanimationCut.onComplete.add(function() {
                    this.farmer.animations.play('breath', 3, true);
                }, this);
                var snameTrunkToCut = this.secondTree.getAt(0).key;
                var snameTrunkJustAfter = this.secondTree.getAt(1).key;

            } else if (action == 'sright') {

                this.farmer.anchor.setTo(1, 0);
                this.farmer.scale.x = -1;
                //place the rat on the right side of the tree
                this.farmer.x = this.farmer.width * -3.8;
                this.farmerPosition = 'sright';


                this.farmer.animations.stop('breath', true);

                var sanimationCut = this.farmer.animations.play('cut', 15);

                sanimationCut.onComplete.add(function() {
                    this.farmer.animations.play('breath', 3, true);
                }, this);


                var snameTrunkToCut = this.secondTree.getAt(0).key;

                var snameTrunkJustAfter = this.secondTree.getAt(1).key;
            }


            // rat
            if (nameTrunkToCut == 'branchLeft' && this.samuraiRatPosition == 'left' || nameTrunkToCut == 'branchRight' && this.samuraiRatPosition == 'right') {
                // Game Over
                this.death("1");
            } else if (action == "left" || action == "right") {
                this.samuraiRat.animations.stop('breath', true);

                var animationCut = this.samuraiRat.animations.play('cut', 15);
                animationCut.onComplete.add(function() {
                    this.samuraiRat.animations.play('breath', 3, true);
                }, this);

                this.cutTrunk();

                if (nameTrunkJustAfter == 'branchLeft' && this.samuraiRatPosition == 'left' || nameTrunkJustAfter == 'branchRight' && this.samuraiRatPosition == 'right') {
                    // Game Over
                    this.death("1");
                }

            }

            // ninja
            if (snameTrunkToCut == 'sbranchLeft' && this.farmerPosition == 'sleft' || snameTrunkToCut == 'sbranchRight' && this.farmerPosition == 'sright') {
                // Game Over
                //game over for the second player
                this.death("", "1");
            } else if (action == "sleft" || action == "sright") {
                this.farmer.animations.stop('breath', true);
                var sanimationCut = this.farmer.animations.play('cut', 15);
                sanimationCut.onComplete.add(function() {
                    this.farmer.animations.play('breath', 3, true);
                }, this);
                this.cutSTrunk();


                if (snameTrunkJustAfter == 'sbranchLeft' && this.farmerPosition == 'sleft' || snameTrunkJustAfter == 'sbranchRight' && this.farmerPosition == 'sright') {
                    // Game Over
                    this.death("", "1");
                }
                console.log(snameTrunkToCut + "to cut" + "pos" + snameTrunkJustAfter + "just after");

            }
        }
    },

    cutTrunk: function() {


        // Increment score
        this.increaseScore("1");

        this.addTrunk();

        var trunkCut = game.add.sprite(37, 1151, this.tree.getAt(0).key);
        this.tree.remove(this.tree.getAt(0));

        //enable the phaser physics
        game.physics.enable(trunkCut, Phaser.Physics.ARCADE);
        trunkCut.anchor.setTo(0.5, 0.5);
        trunkCut.x += trunkCut.width / 2;
        trunkCut.y += trunkCut.height / 2;

        var angle = 0;
        //how the chunck goes
        if (this.samuraiRatPosition == 'left') {
            trunkCut.body.velocity.x = 1300;
            angle = -400;
        } else {
            trunkCut.body.velocity.x = -1300;
            angle = 400;
        }
        trunkCut.body.velocity.y = -800;
        trunkCut.body.gravity.y = 2000;

        game.add.tween(trunkCut).to({ angle: trunkCut.angle + angle }, 1000, Phaser.Easing.Linear.None, true);

        this.canCut = false;

        var that = this;
        this.tree.forEach(function(trunk) {
            var tween = game.add.tween(trunk).to({ y: trunk.y + that.HEIGHT_TRUNK }, 100, Phaser.Easing.Linear.None, true);
            tween.onComplete.add(function() {
                // Une fois que l'arbre à fini son animation, on redonne la possibilité de couper
                that.canCut = true;
            }, that);
        });

    },

    //cut the second trunk 
    cutSTrunk: function() {

        this.increaseScore("2");

        this.addSTrunk();

        var strunkCut = game.add.sprite(1400, 1151, this.secondTree.getAt(0).key);
        this.secondTree.remove(this.secondTree.getAt(0));

        // second tree
        game.physics.enable(strunkCut, Phaser.Physics.ARCADE);
        strunkCut.anchor.setTo(0.5, 0.5);
        strunkCut.x += strunkCut.width / 2;
        strunkCut.y += strunkCut.height / 2;

        var angle = 0;
        if (this.farmerPosition == 'sleft') {
            strunkCut.body.velocity.x = 1300;
            angle = -400;
        } else {
            strunkCut.body.velocity.x = -1300;
            angle = 400;
        }
        strunkCut.body.velocity.y = -800;
        strunkCut.body.gravity.y = 2000;

        game.add.tween(strunkCut).to({ angle: strunkCut.angle + angle }, 1000, Phaser.Easing.Linear.None, true);

        this.canCut = false;

        var sthat = this;
        this.secondTree.forEach(function(strunk) {
            var stween = game.add.tween(strunk).to({ y: strunk.y + sthat.HEIGHT_TRUNK }, 100, Phaser.Easing.Linear.None, true);
            stween.onComplete.add(function() {
                sthat.canCut = true;
            }, sthat);
        });
    },

    constructTree: function() {
        // create the first tree
        this.tree = game.add.group();
        // 2 first simple branches
        this.tree.create(37, 1151, 'trunk1');
        this.tree.create(37, 1151 - this.HEIGHT_TRUNK, 'trunk2');

        // Make the rest of it
        for (var i = 0; i < 4; i++) {
            this.addTrunk();
        }

        // create the second tree
        this.secondTree = game.add.group();
        // 2 first simple branches
        this.secondTree.create(1400, 1151, 'strunk1');
        this.secondTree.create(1400, 1151 - this.HEIGHT_TRUNK, 'strunk2');

        // Make the rest of it
        for (var i = 0; i < 4; i++) {
            this.addSTrunk();
        }


    },

    addTrunk: function() {
        var trunks = ['trunk1', 'trunk2'];
        var branchs = ['branchLeft', 'branchRight'];

        if (branchs.indexOf(this.tree.getAt(this.tree.length - 1).key) == -1) {
            // place branches in random order
            if (Math.random() * 4 <= 1)
                this.tree.create(37, this.stump.y - this.HEIGHT_TRUNK * (this.tree.length + 1), trunks[Math.floor(Math.random() * 2)]);
            else
                this.tree.create(37, this.stump.y - this.HEIGHT_TRUNK * (this.tree.length + 1), branchs[Math.floor(Math.random() * 2)]);
        } else
            this.tree.create(37, this.stump.y - this.HEIGHT_TRUNK * (this.tree.length + 1), trunks[Math.floor(Math.random() * 2)]);

    },

    addSTrunk: function() {
        var strunks = ['strunk1', 'strunk2'];
        var sbranchs = ['sbranchLeft', 'sbranchRight'];

        if (sbranchs.indexOf(this.secondTree.getAt(this.secondTree.length - 1).key) == -1) {
            if (Math.random() * 4 <= 1)
                this.secondTree.create(1400, this.sstump.y - this.HEIGHT_TRUNK * (this.secondTree.length + 1), strunks[Math.floor(Math.random() * 2)]);
            else
                this.secondTree.create(1400, this.sstump.y - this.HEIGHT_TRUNK * (this.secondTree.length + 1), sbranchs[Math.floor(Math.random() * 2)]);
        } else
            this.secondTree.create(1400, this.sstump.y - this.HEIGHT_TRUNK * (this.secondTree.length + 1), strunks[Math.floor(Math.random() * 2)]);

    },

    increaseScore: function(player) {
        if (player == "1") {
            this.currentScore++;
            for (var j = 0; j < this.spritesScoreNumbers.length; j++)
                this.spritesScoreNumbers[j].kill();
            this.spritesScoreNumbers = new Array();

            this.spritesScoreNumbers = this.createSpritesNumbers(this.currentScore, 'numbers', 1300, 1, "1");

        }
        if (player == "2") {
            this.scurrentScore++;

            for (var j = 0; j < this.sspritesScoreNumbers.length; j++)
                this.sspritesScoreNumbers[j].kill();
            this.sspritesScoreNumbers = new Array();

            this.sspritesScoreNumbers = this.createSpritesNumbers(this.scurrentScore, 'numbers', 1300, 1, "2");
        }
    },

    createSpritesNumbers: function(number, imgRef, posY, alpha, player = "0") {

        var digits = number.toString().split('');
        var widthNumbers = 0;

        var arraySpritesNumbers = new Array();


        for (var i = 0; i < digits.length; i++) {
            var spaceBetweenNumbers = 0;
            if (i > 0)
                spaceBetweenNumbers = 5;
            var spriteNumber = game.add.sprite(widthNumbers + spaceBetweenNumbers, posY, imgRef);
            spriteNumber.alpha = alpha;
            spriteNumber.animations.add('number');
            spriteNumber.animations.frame = +digits[i];
            arraySpritesNumbers.push(spriteNumber);
            widthNumbers += spriteNumber.width + spaceBetweenNumbers;
        }
        var numbersGroup = game.add.group();
        for (var i = 0; i < arraySpritesNumbers.length; i++)
            numbersGroup.add(arraySpritesNumbers[i]);
        if (player != "0") {
            numbersGroup.x = (player == "1") ? 490 : 1850;
        } else {
            numbersGroup.x = game.width / 2 - numbersGroup.width / 2;
        }

        return arraySpritesNumbers;
    },

    showCongrats: function() {
        player1 = this.currentScore;
        player2 = this.scurrentScore;

        for (var j = 0; j < this.spritesLevelNumbers.length; j++)
            this.spritesLevelNumbers[j].kill();
        this.spritesLevelNumbers = new Array();

        this.spritesLevelNumbers = this.createSpritesNumbers(player1, 'levelNumbers', this.intituleLevel.y, 0);
        this.sspritesLevelNumbers = this.createSpritesNumbers(player2, 'levelNumbers', this.intituleLevel.y, 0);

        this.intituleLevel.x = 0;
        for (var i = 0; i < this.spritesLevelNumbers.length; i++) {
            if (i == 0)
                this.spritesLevelNumbers[i].x = this.intituleLevel.width + 20;
            else
                this.spritesLevelNumbers[i].x = this.intituleLevel.width + 20 + this.spritesLevelNumbers[i - 1].width;
        }

        for (var i = 0; i < this.sspritesLevelNumbers.length; i++) {
            if (i == 0)
                this.sspritesLevelNumbers[i].x = this.intituleLevel.width + 20;
            else
                this.sspritesLevelNumbers[i].x = this.intituleLevel.width + 20 + this.sspritesLevelNumbers[i - 1].width;
        }
        //draw or victory
        var levelGroup = game.add.group();
        if (player1 == player2) {
            levelGroup.add(this.draw);
        } else {
            levelGroup.add(this.intituleLevel);
        }

        for (var i = 0; i < this.spritesLevelNumbers.length; i++)
            levelGroup.add(this.spritesLevelNumbers[i]);
        levelGroup.x = game.width / 2 - levelGroup.width / 2;

        for (var i = 0; i < this.spritesLevelNumbers.length; i++) {
            game.add.tween(this.spritesLevelNumbers[i]).to({ alpha: 1 }, 300, Phaser.Easing.Linear.None, true);
        }
        if (player1 == player2) {
            game.add.tween(this.draw).to({ alpha: 1 }, 300, Phaser.Easing.Linear.None, true);
        } else {
            game.add.tween(this.intituleLevel).to({ alpha: 1 }, 300, Phaser.Easing.Linear.None, true);
        }

        for (var i = 0; i < this.sspritesLevelNumbers.length; i++) {
            game.add.tween(this.sspritesLevelNumbers[i]).to({ alpha: 1 }, 300, Phaser.Easing.Linear.None, true);
        }
        game.add.tween(this.intituleLevel).to({ alpha: 1 }, 300, Phaser.Easing.Linear.None, true);

        var that = this;

        setTimeout(function() {
            for (var i = 0; i < that.spritesLevelNumbers.length; i++) {
                game.add.tween(that.spritesLevelNumbers[i]).to({ alpha: 0 }, 300, Phaser.Easing.Linear.None, true);

            }
            game.add.tween(that.intituleLevel).to({ alpha: 0 }, 300, Phaser.Easing.Linear.None, true);

        }, 5000);
    },

    death: function(player1 = 0, player2 = 0) {

        if (player1 == 1) {

            GAME_START = false;
            GAME_OVER = true;
            this.canCut = false;
            game.input.onDown.removeAll();

            var that = this;

            var ripTween = game.add.tween(this.samuraiRat).to({ alpha: 0 }, 300, Phaser.Easing.Linear.None, true);

            ripTween.onComplete.add(function() {

                that.rip = game.add.sprite(0, 0, 'rip');
                that.rip.alpha = 0;
                game.add.tween(that.rip).to({ alpha: 1 }, 300, Phaser.Easing.Linear.None, true);
                that.rip.x = (this.samuraiRatPosition == 'left') ? (this.samuraiRat.x + 50) : (this.samuraiRat.x + 200);
                that.rip.y = this.samuraiRat.y + this.samuraiRat.height - that.rip.height;

                setTimeout(function() { that.gameFinish() }, 2000);
            }, this);
        }
        if (player2 == 1) {

            GAME_START = false;
            GAME_OVER = true;
            this.canCut = false;
            game.input.onDown.removeAll();

            var that = this;

            var ripTween = game.add.tween(this.farmer).to({ alpha: 0 }, 300, Phaser.Easing.Linear.None, true);

            ripTween.onComplete.add(function() {

                that.rip = game.add.sprite(0, 0, 'rip');
                that.rip.alpha = 0;
                game.add.tween(that.rip).to({ alpha: 1 }, 300, Phaser.Easing.Linear.None, true);
                that.rip.x = (this.farmerPosition == 'left') ? (this.farmer.x + 50) : (this.farmer.x + 200);
                that.rip.y = this.farmer.y + this.farmer.height - that.rip.height;

                setTimeout(function() { that.gameFinish() }, 2000);
            }, this);

        }
        this.showCongrats();
    },

    gameFinish: function() {
        GAME_START = false;
        GAME_OVER = false;
        game.state.start('main');
    }
};


// Adding 2 functions load and main to the Phaser object 
game.state.add('load', gameState.load);
game.state.add('main', gameState.main);
//start loading the game
game.state.start('load');