import { PageItem } from '../PageItems';
import axios from 'axios';


export function generate_directory(items, userName) {
    // Used by ProfilePage.
    // Creates folders and decks with database items.

	let directory = [];
	items.forEach(
		(item) => {
			const { item_id, item_name, item_type, item_order, words } = item;

			let item_content = (item_type === 'file')
				? words.split(',')
				: "";

			directory.push(<PageItem
				key={item_id}
				id={`${item_id}`}
				name={item_name}
				type={item_type}
				order={parseInt(item_order)}
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
	// Used by: ../ProfilePage -> HandleMouseAction event handler.
	
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

export function delete_item(itemObj, directory, username, setRender, setRequestError) {
	// Used by './components/ItemContextMenu' and '../ProfilePage/BottomDragBar'.
	const message = (
		itemObj.type === 'folder' ? `Delete '${itemObj.name}' and all of its content?`
		: `Delete '${itemObj.name}?'`)
	if (window.confirm(message)) {
		axios.delete(`/u/${username}/delete_item`, {data: {
			item_id: itemObj.id,
			parent_id: directory}}
		)
		.then(() => {setRender()})
		.catch((err) => setRequestError({'exists': true, 'description':err.response.data}));
	}
}

export function get_column_number(containerName, doc, win) {
        const container = doc.querySelector(containerName);
        const gridComputedStyle = win.getComputedStyle(container);
        const gridColumnCount = gridComputedStyle.getPropertyValue("grid-template-columns").split(" ").length;
        return [gridColumnCount];
    }