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
				id={item_id}
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