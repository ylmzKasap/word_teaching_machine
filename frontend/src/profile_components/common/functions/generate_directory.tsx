import PageItem from "../../page_items/page_item";
import { wordDefault } from "../../types/profilePageDefaults";
import { dirInfoTypes, serverItemTypes } from "../../types/profilePageTypes";

export function generate_directory(
  info: dirInfoTypes,
  items: serverItemTypes[],
  username: string
) {
  // Used by ProfilePage.
  // Creates folders and decks with database items.
  const thematicOn = info.item_type === "thematic_folder";

  const categories: serverItemTypes[] = [];
  const otherItems: serverItemTypes[] = [];

  // Separate categories from other stuff.
  if (thematicOn) {
    items.forEach((item) => {
      if (item.item_type === "category") {
        categories.push(item);
      } else {
        otherItems.push(item);
      }
    });
  }

  const iterable = thematicOn ? categories : items;

  let directory: React.ReactElement[] = [];
  iterable.forEach((pgItem) => {
    const {
      item_id,
      item_name,
      item_type,
      item_order,
      completed,
      target_language,
      source_language,
      show_translation,
      category_target_language,
      category_source_language,
      words,
      color,
      purpose,
    } = pgItem;

    directory.push(
      <PageItem
        key={item_id}
        id={`item-${item_id}`}
        name={item_name}
        type={item_type.replace(/_/g, "-")}
        order={parseInt(item_order)}
        words={words ? words : wordDefault}
        color={color ? color : ""}
        purpose={purpose ? purpose : ""}
        show_translation={show_translation ? show_translation : false}
        source_language={
          source_language
            ? source_language
            : category_source_language
            ? category_source_language
            : ""
        }
        target_language={
          target_language
            ? target_language
            : category_target_language
            ? category_target_language
            : ""
        }
        completed={completed ? completed : false}
        user={username}
      >
        {thematicOn &&
          otherItems
            .filter((item) => item.category_id === item_id)
            .map((item) => (
              <PageItem
                key={item.item_id}
                id={`item-${item.item_id}`}
                name={item.item_name}
                type={item.item_type.replace(/_/g, "-")}
                order={parseInt(item.item_order)}
                words={item.words ? item.words : wordDefault}
                color={item.color ? item.color : ""}
                show_translation={
                  item.show_translation ? item.show_translation : false
                }
                source_language={item.source_language}
                target_language={item.target_language}
                completed={item.completed ? item.completed : false}
                user={username}
              />
            ))}
      </PageItem>
    );
  });
  return [...directory];
}

export default generate_directory;