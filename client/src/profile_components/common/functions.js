import { PageItem } from '../PageItems';


export function generate_directory(items, userName) {
    // Used by ProfilePage.
    // Creates folders and decks with database items.

	let directory = [];
	items.forEach(
		(item) => {
			const { item_id, item_name, item_type, item_order, content } = item;

			if (item_type === 'file') {
				var item_content = content.split(',');
			} else if (item_type === 'folder') {
				var item_content = "";
			}

			directory.push(<PageItem
				key={item_id}
				id={`${item_id}`}
				name={item_name}
				type={item_type}
				order={item_order}
				content={item_content}
				user={userName} />
			)
		}  
	);
		
	return [...directory];
}

export function hasKeys(anyObject) {
	return Object.keys(anyObject).length > 0;
}


const setScroll = (setter, elem, cursor, move, timing) => {
	if (timing < 7) {timing = 7} else if (timing > 30) {timing = 30};
	setter({
		'exists': true,
		'element': elem,
		'clientY': cursor,
		'interval': setInterval(() => {
			elem.scrollBy({
				top: move,
			})
		}, timing)
	});
}

export function scroll_div(evnt, win, doc, scrolling, setScrolling, constraints=[]) {
	if (!([...constraints].includes(evnt.target.className.split(" ")[0]))) {
		const scrolledElement = doc.querySelector('.card-container');

		// Scroll bottom
		if (win.innerHeight - 80 < evnt.clientY) {
			let interval = win.innerHeight - evnt.clientY;
			if (!scrolling.exists) {
				setScroll(setScrolling, scrolledElement, evnt.clientY, 10, interval);
			} else {
				if (Math.abs(evnt.clientY - scrolling.clientY) > 8) {
					clearInterval(scrolling.interval);
					setScroll(setScrolling, scrolledElement, evnt.clientY, 10, interval);
				}
			}
		  // Scroll top
		} else if (evnt.clientY < 80) {
			let interval = evnt.clientY;
			if (!scrolling.exists) {
				setScroll(setScrolling, scrolledElement, evnt.clientY, -10, interval);
			} else {
				if (Math.abs(evnt.clientY - scrolling.clientY) > 8) {
					clearInterval(scrolling.interval);
					setScroll(setScrolling, scrolledElement, evnt.clientY, -10, interval);
				}
			}
		  // Cancel scroll due to mouse position.
		} else {
			if (scrolling.exists) {
				clearInterval(scrolling.interval);
				setScrolling({'exists': false}); 
			}
		}
	   // Cancel scroll due to targeting forbidden element.
	}  else {
		if (scrolling.exists) {
			clearInterval(scrolling.interval);
			setScrolling({'exists': false}); 
		}
	}
}