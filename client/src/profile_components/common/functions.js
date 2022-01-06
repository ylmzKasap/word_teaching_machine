import { PageItem } from '../PageItems';


export function generate_directory(items, userName) {
    // Used by ProfilePage.
    // Creates folders and decks with database items.

	let directory = [];
	let folderCount = 0; let fileCount = 0;
	items.forEach(
		(item) => {
			let itemName = item.item_name;
			let order = item.item_order;
			if (item.item_type === 'folder') {
				directory.push(
				<PageItem key={`folder-${folderCount + 1}`} name={itemName}
						type={'folder'} order={order} />
				)
				folderCount += 1;
			} else {
				directory.push(
					<PageItem key={`deck-${fileCount + 1}`} name={itemName} type={'file'}
					allPaths={item.content.split(',')} user={userName} order={order} />
				)
				fileCount += 1;
			}
		}  
	);
	return [...directory];
}

export function hasKeys(anyObject) {
	return Object.keys(anyObject).length > 0;
}