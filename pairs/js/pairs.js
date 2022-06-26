/**
 * Pairs memory game
 */
class Pairs {
	constructor(container, option) {
		this.ignoreAction = false;
		this.option       = Object.assign({
			col: 5,
			row: 4,
			size: 100,
		}, option || {});

		this.col = parseInt(this.option.col, 10) || 5;
		this.row = parseInt(this.option.row, 10) || 4;
		this.count = this.col * this.row;
		if (this.count % 2) {
			this.row++;
			this.count = this.col * this.row;
		}
		this.itemCount = this.count / 2;

		this.size = parseInt(this.option.size, 10) || 100;

		this.container = $(container)
			.css({
				grid: `repeat(${this.row}, ${this.size}px) / repeat(${this.col}, ${this.size}px)`,
			});

		this.start();
	}

	/**
	 * start game
	 */
	start() {
		console.log('start');
		this.items = [];
		this.prev = null;
		this.foundCount = 0;

		this.initContainer();
		this.preview();
	}

	end() {
		console.log('END');
		setTimeout(_ => {
			alert('END');
		}, 500);
	}

	initContainer() {
		this.items = this.getItems(this.itemCount);
		console.log(this.items, this.itemCount);

		this.container.html('');
		this.items.forEach((item) => {
			this.container.append(item.getItem());
		});
	}

	preview() {
		const timeout = 2000;
		this.ignoreAction = true;
		this.items.forEach((item) => {
			item.show();
		});
		setTimeout(_ => {
			this.items.forEach((item) => {
				item.hide();
			});
			this.ignoreAction = false;
		}, timeout);
	}

	getItems(itemCount) {
		const items = [];
		for (let i = 1; i <= itemCount; i++) {
			items.push(new PairItem(i, i, this));
			items.push(new PairItem(i, i, this));
		}

		return this.shuffle(items);
	}

	shuffle(array) {
		return array
			.map((item) => {
				item.random = Math.random();
				return item;
			})
			.sort((a, b) => a.random - b.random);
	}

	onClick(item) {
		if (this.ignoreAction) {
			console.log('block');
			return;
		}

		console.log(item, this.prev);
		item.show();

		if (!this.prev) {
			this.prev = item;
			return;
		}

		const prev = this.prev;
		if (prev === item) {
			console.log('same');
			return;
		}

		this.prev = null;
		if (prev.id === item.id) {
			prev.setFound();
			item.setFound();
			this.foundCount++;

			if (this.foundCount >= this.itemCount) {
				this.end();
			}
			return;
		}

		this.ignoreAction = true;
		setTimeout(_ => {
			prev.hide();
			item.hide();
			this.ignoreAction = false;
		}, 1000);
	}
}

/**
 * Pair item
 */
class PairItem {
	constructor(id, content, controller) {
		this.id = id;
		this.content = content;
		this.controller = controller;
		this.item = this.initItem();
		this.found = false;
	}

	initItem() {
		const item = $(`<div class="pair-item"></div>`)
			.data('id', this.id)
			.on('click', () => {
				if (this.found) {
					// do nothing
					return;
				}
				this.controller.onClick(this);
			});
		item.content = $(`<div class="pair-item-content">${this.content}</div>`).appendTo(item);

		return item;
	}

	getItem() {
		return this.item;
	}

	setFound() {
		this.found = true;
		$(this.item.content).addClass('found');
	}

	isVisible() {
		return this.item.content.is(':visible');
	}

	show() {
		this.item.content.show();
	}

	hide() {
		this.item.content.hide();
	}
}