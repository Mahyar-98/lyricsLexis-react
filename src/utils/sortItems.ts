import SavedSong from "@/types/SavedSong";
import SavedWord from "@/types/SavedWord";

const sortItems = <T extends SavedSong | SavedWord>(
  items: T[],
  sortBy: keyof T,
  sortOrder: "asc" | "desc",
): T[] => {
  return items.slice().sort((a, b) => {
    const aValue = a[sortBy] as unknown as string | number | Date;
    const bValue = b[sortBy] as unknown as string | number | Date;

    if (sortBy === "createdAt") {
      return sortOrder === "asc"
        ? new Date(aValue).getTime() - new Date(bValue).getTime()
        : new Date(bValue).getTime() - new Date(aValue).getTime();
    } else if (sortBy === "title" || sortBy === "artist" || sortBy === "word") {
      return sortOrder === "asc"
        ? aValue.toString().localeCompare(bValue.toString())
        : bValue.toString().localeCompare(aValue.toString());
    } else if (sortBy === "learned") {
      // Flip the order for "learned" attribute
      return sortOrder === "asc" ? (aValue ? -1 : 1) : aValue ? 1 : -1;
    }
    return 0;
  });
};

export default sortItems;
