// Setting the variables for the game
var GAME_START = false;
var GAME_OVER = false;

// dimensions of the screen
const width = 1080; //2496
const height = 1775;

// making use of the Game class to instantiate a Phaser object 
var game = new Phaser.Game(width, height, Phaser.AUTO, 'thegame');
game.transparent = true;

// Declaration of "load" and "main" phases of the game
var gameState = {};
gameState.load = function() {};
gameState.main = function() {};

// Loading the resourses
gameState.load.prototype = {
    preload: function() {
        // background
        game.load.image('background', 'img/background.png');
        // 1st character
        game.load.atlas('rat', 'img/rat.png', 'data/rat.json');
        // the bamboo
        game.load.image('trunk1', 'img/trunk1.png');
        game.load.image('trunk2', 'img/trunk2.png');
        game.load.image('branchLeft', 'img/branch1.png');
        game.load.image('branchRight', 'img/branch2.png');
        game.load.image('stump', 'img/stump.png');
    },

    create: function() {
        game.state.start('main');
    }
};

// core of the game
gameState.main.prototype = {
    create: function() {
        // the physics of the arcade
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // make the game resize based on the screen
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.setShowAll();
        window.addEventListener('resize', function() {
            game.scale.refresh();
        });
        game.scale.refresh();

        // create a canvas
        this.background = game.add.sprite(0, 0, 'background');
        this.background.width = game.width;
        this.background.height = game.height;

        // Bamboo part
        //stump
        this.stump = game.add.sprite(0, 0, 'stump');
        this.stump.x = 352;
        this.stump.y = 1394;
        // actual tree
        this.HEIGHT_TRUNK = 243;
        this.constructTree();
        this.canCut = true;

        // ---- Ninja Rat
        // Crete the character
        this.rat = game.add.sprite(0, 1070, 'rat');
        // breath frames from the json file
        this.rat.animations.add('breath', [0, 1]);
        // cut process
        this.rat.animations.add('cut', [1, 2, 3, 4]);
        // second repeat
        this.rat.animations.play('breath', 3, true);
        // Position of the rat
        this.ratPosition = 'left';

        // add listener
        game.input.onDown.add(this.listener, this);

    },

    update: function() {
        if (!GAME_OVER) {
            // detect if the game is over
            if (game.input.keyboard.justPressed(Phaser.Keyboard.LEFT))
                this.listener('left');
            else if (game.input.keyboard.justPressed(Phaser.Keyboard.RIGHT)) {
                this.listener('right');
            }
        }
    },

    listener: function(action) {

        if (this.canCut) {

            // First interaction triggers the start of the game
            if (!GAME_START) {
                GAME_START = true;
            }

            var isClick = action instanceof Phaser.Pointer;
            if (action == 'left' || (isClick && game.input.activePointer.x <= game.width / 2)) {
                this.man.anchor.setTo(0, 0);
                this.man.scale.x = 1;
                this.man.x = 0;
                this.manPosition = 'left';
            } else {

                this.man.anchor.setTo(1, 0);
                this.man.scale.x = -1;
                this.man.x = game.width - Math.abs(this.man.width);
                this.manPosition = 'right';
            }


            this.man.animations.stop('breath', true);
            var animationCut = this.man.animations.play('cut', 15);
            animationCut.onComplete.add(function() {
                this.man.animations.play('breath', 3, true);
            }, this);


        }

    },



    constructTree: function() {
        // building of the tree
        this.tree = game.add.group();
        // first 2 should be simple
        this.tree.create(37, 1151, 'trunk1');
        this.tree.create(37, 1151 - this.HEIGHT_TRUNK, 'trunk2');

        // the rest
        for (var i = 0; i < 4; i++) {
            this.addTrunk();
        }
    },

    addTrunk: function() {
        var trunks = ['trunk1', 'trunk2'];
        var branchs = ['branchLeft', 'branchRight'];
        // if the last one is not a branch
        if (branchs.indexOf(this.tree.getAt(this.tree.length - 1).key) == -1) {

            if (Math.random() * 4 <= 1)
                this.tree.create(37, this.stump.y - this.HEIGHT_TRUNK * (this.tree.length + 1), trunks[Math.floor(Math.random() * 2)]);

            else
                this.tree.create(37, this.stump.y - this.HEIGHT_TRUNK * (this.tree.length + 1), branchs[Math.floor(Math.random() * 2)]);
        }
        // If previous trunk is a branch put a simple trunk
        else
            this.tree.create(37, this.stump.y - this.HEIGHT_TRUNK * (this.tree.length + 1), trunks[Math.floor(Math.random() * 2)]);
    },

    gameFinish: function() {

        GAME_START = false;
        GAME_OVER = false;
        game.state.start('main');
    }
};


// Adding of the 2 main functions to the Phaser project
game.state.add('load', gameState.load);
game.state.add('main', gameState.main);

game.state.start('load');