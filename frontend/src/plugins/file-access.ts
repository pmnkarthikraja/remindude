import { registerPlugin } from '@capacitor/core';

export interface FileAccessPlugin {
  openManageAllFilesSettings(): Promise<void>;
}

const FileAccess = registerPlugin<FileAccessPlugin>('FileAccess');

export default FileAccess;