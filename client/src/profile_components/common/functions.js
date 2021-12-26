import { Deck, Folder } from '../PageItems';


export function generate_decks(items, userName) {
    // Used by ProfilePage.
    // Creates folders and decks with database items.

	let decks = [];
	items.forEach(
		(item, index) => {
			let itemName = item.item_name;
			if (item.item_type === 'folder') {
				decks.push(<Folder key={`folder-${index + 1}`} folderName={itemName} />)
			} else {
				decks.push(
					<Deck allPaths={item.content.split(',')}
					key={`deck-${index + 1}`} deckName={itemName} user={userName} />
				)
			}
		}  
	);
	return [...decks];
}