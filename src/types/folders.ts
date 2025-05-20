
export type Folder = {
  id: string;
  name: string;
  color: string;
  created_at: string;
  user_id: string;
};

export type FolderItem = {
  id: string;
  folder_id: string;
  item_id: string;
  item_type: 'note' | 'beat';
  created_at: string;
};
