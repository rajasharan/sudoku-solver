const worker = new Worker('sudoku.js');
worker.addEventListener('message', function (e) {
    const { cmd, i, j, num, result } = e.data;
    if (cmd === 'inprogress') {
        app.items[i][j] = num;
        app.fromArray();
    }
    else if (cmd === 'done') {
        app.inprogress = false;
        app.displayError(result);
    }
}, false);

Vue.use(Buefy);

const app = new Vue({
    el: '#sudoku',
    data: {
        items: [], // 2d Array
        itemsHelper: [], // 1d representation of above grid
        inprogress: false,
        speed: 50,
    },
    computed: {
    },
    created: function () {
        this.reset();
    },
    methods: {
        update: function (e, i, j) {
            if (this.inprogress) return;
            e.stopPropagation();
            const obj = this.itemsHelper.find(obj => obj.i === i && obj.j === j);
            if (obj) {
                obj.num = (obj.num + 1) % 10;
                obj.default = true;
                this.items[j][i] = obj.num;
            }
        },
        fill: function (i, j) {
            const obj = this.itemsHelper.find(obj => obj.i === i && obj.j === j);
            if (obj && obj.num === 0) return 'none';
            else if (obj && obj.default) return 'default';
            else return 'new';
        },
        solve: function () {
            worker.postMessage({cmd: 'solve', items: this.items, speed: this.speed});
            this.fromArray();
            this.inprogress = true;
        },
        log: function () {
            console.log(this.items);
        },
        toArray: function () {
            let c = 0;
            for (let j=0; j<9; j++) {
                for (let i=0; i<9; i++) {
                    if (!this.items[i]) this.items[i] = [];
                    this.items[i][j] = this.itemsHelper[c].num;
                    c = c + 1;
                }
            }
        },
        fromArray: function () {
            let c = 0;
            for (let j=0; j<9; j++) {
                for (let i=0; i<9; i++) {
                    this.itemsHelper[c].num = this.items[i][j];
                    c = c + 1;
                }
            }
        },
        reset: function () {
            this.itemsHelper = [];
            for (const i of Array(9).keys()) {
                for (const j of Array(9).keys()) {
                    this.itemsHelper.push({ key: `${i+1}${j+1}`, i, j, x: 6+(i*32), y: 30+(j*32), num: 0 });
                }
            }

            this.find('14', 7);
            this.find('16', 1);

            this.find('28', 8);
            this.find('29', 5);

            this.find('43', 6);
            this.find('45', 4);
            this.find('47', 1);

            this.find('52', 3);
            this.find('57', 2);

            this.find('62', 5);

            this.find('74', 3);
            this.find('75', 8);
            this.find('79', 6);

            this.find('81', 1);
            this.find('83', 7);
            this.find('88', 4);

            this.find('91', 2);

            // additional
            this.find('11', 6);
            this.find('21', 7);
            this.find('12', 9);
            this.find('82', 8);
            this.find('17', 4);
            this.find('36', 4);
            this.find('34', 8);
            this.find('66', 9);

            this.toArray();
        },
        speedChanged: function (speed) {
            console.log(speed, this.speed);
            this.speed = speed;
            worker.postMessage({cmd: 'speed', items: [], speed});
        },
        find: function (key, num) {
            const e = this.itemsHelper.find(obj => obj.key === key);
            e.num = num;
            e.default = true;
        },
        displayError: function (result) {
            console.log(result);
            if (result) this.$buefy.snackbar.open({
                message: 'Finished',
                position: 'is-bottom',
            });

            else this.$buefy.snackbar.open({
                duration: 6000,
                message: 'ERROR - cannot solve',
                type: 'is-danger',
                position: 'is-bottom',
            });
        },
    },
});
